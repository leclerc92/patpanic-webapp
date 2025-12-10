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
import { Logger } from '@nestjs/common';
import { GameService } from '../services/game.service';

@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('GameGateway');

  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connecté : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté : ${client.id}`);
    // Note : Socket.io gère automatiquement la sortie des rooms,
    // mais tu pourrais ajouter ici une logique pour prévenir le jeu si besoin.
  }

  // --- GESTION DES SALLES ---
  @SubscribeMessage('getRoomsInfo')
  handleGetRoomsInfo(client: Socket) {
    client.emit('roomsInfo', this.gameService.getRoomsInfo());
  }

  @SubscribeMessage('joinGame')
  handleJoinGame(
    @MessageBody() data: { roomId: string; name: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const roomId = data.roomId.toUpperCase();
      const game = this.gameService.getGameInstance(roomId);

      game.addPlayer(data.name, client.id);

      client.join(roomId);

      // On stocke la roomId dans le socket pour les futures requêtes
      client.data.roomId = roomId;

      this.logger.log(`${data.name} a rejoint ${roomId}`);

      this.server.to(roomId).emit('gameStatus', game.getGameStatus());
    } catch (e) {
      client.emit('error', e.message);
    }
  }

  // Helper pour récupérer l'instance du joueur actuel
  private getGameFromSocket(client: Socket) {
    // TypeScript ne connait pas 'roomId' sur data par défaut, on peut caster ou laisser tel quel si ça passe
    const roomId = client.data.roomId;
    if (!roomId) throw new Error("Vous n'êtes pas dans une salle !");
    return this.gameService.getGameInstance(roomId);
  }

  @SubscribeMessage('startPlayerTurn')
  handleStartPlayerTurn(@ConnectedSocket() client: Socket) {
    const game = this.getGameFromSocket(client);
    // On passe 'this.server' pour que l'instance puisse émettre à sa room spécifique
    game.startTurn(this.server);
    this.server.to(game.roomId).emit('gameStatus', game.getGameStatus());
  }

  @SubscribeMessage('validate')
  handleValidate(@ConnectedSocket() client: Socket) {
    const game = this.getGameFromSocket(client);
    game.validateCard();
    this.server.to(game.roomId).emit('gameStatus', game.getGameStatus());
  }

  @SubscribeMessage('pass')
  handlePass(@ConnectedSocket() client: Socket) {
    const game = this.getGameFromSocket(client);
    game.passCard();
    this.server.to(game.roomId).emit('gameStatus', game.getGameStatus());
  }

  @SubscribeMessage('goToRoundInstructions')
  handleRoundInstructions(@ConnectedSocket() client: Socket) {
    const game = this.getGameFromSocket(client);
    game.initializeRound();
    this.server.to(game.roomId).emit('gameStatus', game.getGameStatus());
  }

  @SubscribeMessage('gotToPlayerInstructions')
  handlePlayerInstructions(@ConnectedSocket() client: Socket) {
    const game = this.getGameFromSocket(client);
    game.setupNextPlayerTurn();
    this.server.to(game.roomId).emit('gameStatus', game.getGameStatus());
  }

  @SubscribeMessage('getPersonnalCard')
  handleSelectTheme(
    @MessageBody() data: { playerId: string; theme: string },
    @ConnectedSocket() client: Socket,
  ) {
    const game = this.getGameFromSocket(client);
    game.generatePlayerPersonnalCard(data.playerId, data.theme);
    this.server.to(game.roomId).emit('gameStatus', game.getGameStatus());
  }

  @SubscribeMessage('getThemeCapacities')
  handleGetThemeCapacities(client: Socket) {
    const game = this.getGameFromSocket(client);
    const capacities = game.getThemeCapacities();
    this.server.to(game.roomId).emit('themeCapacities', capacities);
  }

  @SubscribeMessage('getAllThemes')
  handleGetAllThemes(client: Socket) {
    const game = this.getGameFromSocket(client);
    const themes = game.getAllThemes();
    this.server.to(game.roomId).emit('themes', [...new Set(themes)]);
  }
}
