import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { GameService } from '../services/game.service';
import { JoinGameDto } from '../dtos/joinGameDto';
import { SelectThemeDto } from '../dtos/selectThemeDto';
import { GameInstanceService } from '../services/game-instance.service';
import { ThrottlerGuard } from '@nestjs/throttler';

// Interface pour typer le socket enrichi
interface GameSocket extends Socket {
  data: {
    roomId?: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [
      'http://localhost:5173',
    ],
    credentials: true,
  },
})
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
@UseGuards(ThrottlerGuard)
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

  handleConnection(client: Socket) {
    this.logger.log(`Client connecté : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté : ${client.id}`);
  }

  // --- GESTION DES SALLES ---

  @SubscribeMessage('getRoomsInfo')
  handleGetRoomsInfo(client: Socket) {
    client.emit('roomsInfo', this.gameService.getRoomsInfo());
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(
    @MessageBody() data: JoinGameDto,
    @ConnectedSocket() client: GameSocket,
  ) {
    try {
      const roomId = data.roomId.toUpperCase();
      const game = this.gameService.getGameInstance(roomId);

      game.addPlayer(data.name, client.id);

      client.join(roomId);
      client.data.roomId = roomId; // Stockage persistant sur le socket

      this.logger.log(`${data.name} a rejoint ${roomId}`);
      this.server.to(roomId).emit('gameStatus', game.getGameStatus());
    } catch (e) {
      client.emit('error', this.getErrorMessage(e));
    }
  }

  @SubscribeMessage('addOfflinePlayer')
  handleAddOfflinePlayer(
    @MessageBody() data: { name: string },
    @ConnectedSocket() client: GameSocket,
  ) {
    try {
      const game = this.getGameFromSocket(client);

      game.addPlayer(data.name);
      this.server.to(game.roomId).emit('gameStatus', game.getGameStatus());
    } catch (e) {
      client.emit('error', this.getErrorMessage(e));
    }
  }

  private getGameFromSocket(client: GameSocket): GameInstanceService {
    const roomId = client.data.roomId;
    if (!roomId) throw new Error("Vous n'êtes pas connecté à une salle !");
    return this.gameService.getGameInstance(roomId);
  }

  // Wrapper pour éviter la répétition du try/catch (Design Pattern)
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
      game.startTurn(this.server);
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

  @SubscribeMessage('getPersonnalCard')
  handleSelectTheme(
    @MessageBody() data: SelectThemeDto,
    @ConnectedSocket() client: GameSocket,
  ) {
    this.handleGameAction(client, (game) => {
      const player = game.getPlayers().find((p) => p.socketId === client.id);
      if (!player) {
        throw new Error('Joueur introuvable pour ce socket');
      }
      game.generatePlayerPersonnalCard(player.id, data.theme);
    });
  }

  // Infos globales (Pas besoin de broadcast state global ici)
  @SubscribeMessage('getThemeCapacities')
  handleGetThemeCapacities(@ConnectedSocket() client: GameSocket) {
    try {
      const game = this.getGameFromSocket(client);
      // On renvoie UNIQUEMENT à la salle concernée (ou au client seul)
      const capacities = game.getThemeCapacities();
      // client.emit est mieux ici que server.to(room) pour éviter de spammer tout le monde quand UN seul ouvre le menu
      client.emit('themeCapacities', capacities);
    } catch (e) {
      client.emit('error', this.getErrorMessage(e));
    }
  }

  @SubscribeMessage('getAllThemes')
  handleGetAllThemes(@ConnectedSocket() client: GameSocket) {
    try {
      const game = this.getGameFromSocket(client);
      const themes = game.getAllThemes();
      client.emit('themes', [...new Set(themes)]);
    } catch (e) {
      client.emit('error', this.getErrorMessage(e));
    }
  }
}
