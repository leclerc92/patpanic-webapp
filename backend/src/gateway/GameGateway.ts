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
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { GameService } from '../services/game.service';
import { JoinGameDto } from '../dtos/joinGameDto';
import { SelectThemeDto } from '../dtos/selectThemeDto';
import { SetMasterPlayerDto } from '../dtos/setMasterPlayerDto';
import { ReconnectPlayerDto } from '../dtos/reconnectPlayerDto';
import { GameInstanceService } from '../services/game-instance.service';
import { GameState } from '@patpanic/shared';
import { UpdatePlayerConfigDto } from '../dtos/updatePlayerConfigDto';

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
      /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/,
      /^http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:5173$/,
    ],
    credentials: true,
  },
})
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    exceptionFactory: (errors) => {
      // Logger les erreurs de validation
      const logger = new Logger('ValidationPipe');
      logger.error(
        `❌ Validation échouée: ${JSON.stringify(
          errors.map((e) => ({
            property: e.property,
            constraints: e.constraints,
          })),
        )}`,
      );
      return errors;
    },
  }),
)
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

      // Protection : on ne peut rejoindre que si la partie est en LOBBY
      if (game.getGameState() !== GameState.LOBBY) {
        throw new Error('La partie a déjà commencé, impossible de rejoindre');
      }

      game.addPlayer(data.name, client.id);

      client.join(roomId);
      client.data.roomId = roomId;

      this.logger.log(`${data.name} a rejoint ${roomId}`);
      this.server.to(roomId).emit('gameStatus', game.getGameStatus());
    } catch (e) {
      this.logger.error(this.getErrorMessage(e));
      client.emit('error', this.getErrorMessage(e));
    }
  }

  @SubscribeMessage('reconnectPlayer')
  handleReconnectPlayer(
    @MessageBody() data: ReconnectPlayerDto,
    @ConnectedSocket() client: GameSocket,
  ) {
    try {
      const roomId = data.roomId.toUpperCase();
      const game = this.gameService.getGameInstance(roomId);

      // Mettre à jour le socketId du joueur existant
      const player = game.updatePlayerSocketId(data.playerId, client.id);

      client.join(roomId);
      client.data.roomId = roomId;

      this.logger.log(`${player.name} s'est reconnecté à ${roomId}`);
      this.server.to(roomId).emit('gameStatus', game.getGameStatus());
    } catch (e) {
      this.logger.error(this.getErrorMessage(e));
      client.emit('error', this.getErrorMessage(e));
    }
  }

  @SubscribeMessage('addPlayer')
  handleAddPlayer(
    @MessageBody() data: { name: string },
    @ConnectedSocket() client: GameSocket,
  ) {
    try {
      const game = this.getGameFromSocket(client);

      // Protection : on ne peut ajouter que si la partie est en LOBBY
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

  @SubscribeMessage('pause')
  handlePause(@ConnectedSocket() client: GameSocket) {
    this.handleGameAction(client, (game) => {
      game.pauseGame(this.server);
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

  @SubscribeMessage('setMasterPlayer')
  handleSetMasterPlayer(
    @MessageBody() data: SetMasterPlayerDto,
    @ConnectedSocket() client: GameSocket,
  ) {
    this.handleGameAction(client, (game) => {
      const player = game.getPlayers().find((p) => p.id === data.playerId);
      if (!player) {
        throw new Error("Le joueur n'est pas trouvé pour le déclarer master");
      }
      if (player.socketId === 'invite' && data.type == 1) {
        throw new Error(
          'Le joueur est invité, il ne peut pas être déclaré master',
        );
      }
      game.setMaster(data.playerId, data.type);
    });
  }

  @SubscribeMessage('updatePlayerConfig')
  handleUpdatePlayerConfig(
    @MessageBody() data: UpdatePlayerConfigDto,
    @ConnectedSocket() client: GameSocket,
  ) {
    this.handleGameAction(client, (game) => {
      console.log('update player');
      game.updatePlayerConfig(data.playerId, data.newName, data.newIcon);
      this.server.to(game.roomId).emit('updatedPlayerConfig', {
        name: data.newName,
        icon: data.newIcon,
      });
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
    try {
      const capacities = this.gameService.getThemeCapacities();
      client.emit('themeCapacities', capacities);
    } catch (e) {
      this.logger.error(`getThemeCapacities: ${this.getErrorMessage(e)}`);
      client.emit('error', this.getErrorMessage(e));
    }
  }

  @SubscribeMessage('getAllThemes')
  handleGetAllThemes(@ConnectedSocket() client: GameSocket) {
    try {
      const themes = this.gameService.getAllThemes();
      client.emit('themes', [...new Set(themes)]);
    } catch (e) {
      this.logger.error(`getAllThemes: ${this.getErrorMessage(e)}`);
      client.emit('error', this.getErrorMessage(e));
    }
  }
}
