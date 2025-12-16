import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { GameService } from '../services/game.service';
import { JoinGameDto } from '../dtos/joinGameDto';
import { SelectThemeDto } from '../dtos/selectThemeDto';
import { AddPlayerDto } from '../dtos/addPlayerDto';
import { GameInstanceService } from '../services/game-instance.service';
import { GameState } from '@patpanic/shared';
import { UpdatePlayerConfigDto } from '../dtos/updatePlayerConfigDto';
import { AdjustTurnScoreDto } from '../dtos/adjustTurnScoreDto';
import { SocketIOGameEventEmitter } from '../adapters/socket-io-game-event-emitter';
import { WsThrottlerGuard } from '../guards/ws-throttler.guard';
import { getAllowedOrigins } from '../config/cors.config';

// Interface pour typer le socket enrichi
interface GameSocket extends Socket {
  data: {
    roomId?: string;
  };
}

@WebSocketGateway({
  cors: {
    // Uses shared CORS configuration
    // Note: Decorator is static, so we use process.env directly here
    // but at least centralize the pattern logic in cors.config.ts
    origin: getAllowedOrigins(process.env.ALLOWED_ORIGINS),
    credentials: true,
  },
})
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    exceptionFactory: (errors) => {
      // Log validation errors without exposing sensitive data
      const logger = new Logger('ValidationPipe');
      const errorSummary = errors
        .map(
          (e) =>
            `${e.property}: ${Object.keys(e.constraints || {}).join(', ')}`,
        )
        .join('; ');
      logger.error(`Validation failed: ${errorSummary}`);
      return errors;
    },
  }),
)
@UseGuards(WsThrottlerGuard)
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('GameGateway');

  constructor(private readonly gameService: GameService) {}

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  /**
   * Crée une instance de l'event emitter Socket.IO.
   * Permet de découpler la logique métier de l'implémentation Socket.IO.
   */
  private getEventEmitter() {
    return new SocketIOGameEventEmitter(this.server);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connecté : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.handleGameAction(client, (game) => {
      this.logger.log(`Client déconnecté : ${client.id}`);
      if (game.getGameState() === GameState.PLAYING) {
        game.pauseGame(this.getEventEmitter());
      }
    });
  }

  @SubscribeMessage('getRoomsInfo')
  handleGetRoomsInfo(client: Socket) {
    client.emit('roomsInfo', this.gameService.getRoomsInfo());
  }

  @SubscribeMessage('joinGame')
  async handleJoinGame(
    @MessageBody() data: JoinGameDto,
    @ConnectedSocket() client: GameSocket,
  ) {
    try {
      const roomId = data.roomId.toUpperCase();

      const roomClients = this.server.sockets.adapter.rooms.get(roomId);
      if (roomClients && roomClients.size > 0) {
        throw new Error(`La room ${roomId} a déjà un maître du jeu !`);
      }

      const game = this.gameService.getGameInstance(roomId);
      await client.join(roomId);
      client.data.roomId = roomId;
      this.logger.log(`Un client à rejoint ${roomId}`);
      this.server.to(roomId).emit('gameStatus', game.getGameStatus());
    } catch (e) {
      this.logger.error(this.getErrorMessage(e));
      client.emit('error', this.getErrorMessage(e));
    }
  }

  @SubscribeMessage('addPlayer')
  handleAddPlayer(
    @MessageBody() data: AddPlayerDto,
    @ConnectedSocket() client: GameSocket,
  ) {
    try {
      const game = this.getGameFromSocket(client);

      if (game.getGameState() !== GameState.LOBBY) {
        throw new Error(
          "La partie a déjà commencé, impossible d'ajouter des joueurs",
        );
      }

      game.addPlayer(data.name);
      this.server.to(game.roomId).emit('gameStatus', game.getGameStatus());
    } catch (e) {
      this.logger.error(this.getErrorMessage(e));
      client.emit('error', this.getErrorMessage(e));
    }
  }

  @SubscribeMessage('removePlayer')
  async handleRemovePlayer(
    @MessageBody() data: { playerId: string },
    @ConnectedSocket() client: GameSocket,
  ) {
    try {
      const game = this.getGameFromSocket(client);

      // Protection : on ne peut supprimer que si la partie est en LOBBY
      if (game.getGameState() !== GameState.LOBBY) {
        throw new Error(
          'La partie a déjà commencé, impossible de supprimer des joueurs',
        );
      }

      // Trouver le joueur avant de le supprimer
      const playerToRemove = game
        .getPlayers()
        .find((p) => p.id === data.playerId);
      if (playerToRemove && playerToRemove.socketId !== 'invite') {
        // Notifier le joueur qu'il a été supprimé
        this.server.to(playerToRemove.socketId!).emit('playerRemoved');

        // Déconnecter le joueur de la room Socket.IO
        const socketToRemove = await this.server.in(game.roomId).fetchSockets();
        const targetSocket = socketToRemove.find(
          (s) => s.id === playerToRemove.socketId,
        );
        if (targetSocket) {
          targetSocket.leave(game.roomId);
        }
      }

      game.removePlayer(data.playerId);
      this.server.to(game.roomId).emit('gameStatus', game.getGameStatus());
    } catch (e) {
      this.logger.error(this.getErrorMessage(e));
      client.emit('error', this.getErrorMessage(e));
    }
  }

  private getGameFromSocket(client: GameSocket): GameInstanceService {
    const roomId = client.data.roomId;
    if (!roomId) throw new Error("Vous n'êtes pas connecté à une salle !");
    return this.gameService.getGameInstance(roomId);
  }

  private handleGameAction(
    client: GameSocket,
    action: (game: GameInstanceService) => void,
  ) {
    try {
      const game = this.getGameFromSocket(client);
      action(game);
      this.server.to(game.roomId).emit('gameStatus', game.getGameStatus());
    } catch (e) {
      this.logger.error(`Erreur action jeu: ${this.getErrorMessage(e)}`);
      client.emit('error', this.getErrorMessage(e));
    }
  }

  @SubscribeMessage('startPlayerTurn')
  handleStartPlayerTurn(@ConnectedSocket() client: GameSocket) {
    this.handleGameAction(client, (game) => {
      game.startTurn(this.getEventEmitter());
    });
  }

  @SubscribeMessage('validate')
  handleValidate(@ConnectedSocket() client: GameSocket) {
    this.handleGameAction(client, (game) => {
      game.validateCard();
    });
  }

  @SubscribeMessage('pass')
  handlePass(@ConnectedSocket() client: GameSocket) {
    this.handleGameAction(client, (game) => {
      game.passCard();
    });
  }

  @SubscribeMessage('pause')
  handlePause(@ConnectedSocket() client: GameSocket) {
    this.handleGameAction(client, (game) => {
      game.pauseGame(this.getEventEmitter());
    });
  }

  @SubscribeMessage('goToRoundInstructions')
  handleRoundInstructions(@ConnectedSocket() client: GameSocket) {
    this.handleGameAction(client, (game) => {
      game.initializeRound();
    });
  }

  @SubscribeMessage('gotToPlayerInstructions')
  handlePlayerInstructions(@ConnectedSocket() client: GameSocket) {
    this.handleGameAction(client, (game) => {
      game.setupNextPlayerTurn();
    });
  }

  @SubscribeMessage('updatePlayerConfig')
  handleUpdatePlayerConfig(
    @MessageBody() data: UpdatePlayerConfigDto,
    @ConnectedSocket() client: GameSocket,
  ) {
    this.handleGameAction(client, (game) => {
      game.updatePlayerConfig(data.playerId, data.newName, data.newIcon);
      this.server.to(game.roomId).emit('updatedPlayerConfig', {
        name: data.newName,
        icon: data.newIcon,
      });
    });
  }

  @SubscribeMessage('adjustTurnScore')
  handleAdjustTurnScore(
    @MessageBody() data: AdjustTurnScoreDto,
    @ConnectedSocket() client: GameSocket,
  ) {
    this.handleGameAction(client, (game) => {
      game.adjustTurnScore(data.playerId, data.adjustment);
    });
  }

  @SubscribeMessage('restartGame')
  handleRestartGame(@ConnectedSocket() client: GameSocket) {
    this.handleGameAction(client, (game) => {
      game.restartGame();
    });
  }

  @SubscribeMessage('getPersonnalCard')
  handleSelectTheme(
    @MessageBody() data: SelectThemeDto,
    @ConnectedSocket() client: GameSocket,
  ) {
    this.handleGameAction(client, (game) => {
      game.generatePlayerPersonnalCard(data.playerId, data.theme);
    });
  }

  @SubscribeMessage('getThemeCapacities')
  handleGetThemeCapacities(@ConnectedSocket() client: GameSocket) {
    const capacities = this.gameService.getThemeCapacities();
    client.emit('themeCapacities', capacities);
  }

  @SubscribeMessage('getAllThemes')
  handleGetAllThemes(@ConnectedSocket() client: GameSocket) {
    const themes = this.gameService.getAllThemes();
    client.emit('themes', [...new Set(themes)]);
  }

  @SubscribeMessage('closeRoom')
  handleCloseRoom(@ConnectedSocket() client: GameSocket) {
    try {
      const roomId = client.data.roomId;
      if (!roomId) throw new Error("Vous n'êtes pas connecté à une salle !");

      this.logger.log(`Closing room ${roomId}`);

      this.server.to(roomId).emit('roomClosed');
      this.server.in(roomId).socketsLeave(roomId);
      this.gameService.resetGameInstance(roomId);

      this.logger.log(`Room ${roomId} closed and reset`);
    } catch (e) {
      this.logger.error(`closeRoom: ${this.getErrorMessage(e)}`);
      client.emit('error', this.getErrorMessage(e));
    }
  }
}
