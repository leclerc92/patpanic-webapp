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
import { UUID } from 'node:crypto';

// cors: true est CRUCIAL pour que ton React (port 5173) puisse parler au Nest (port 3000)
@WebSocketGateway({ cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('GameGateway');

  constructor(private readonly gameService: GameService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connecté : ${client.id}`);
    client.emit('gameStatus', this.gameService.getGameStatus());
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté : ${client.id}`);
  }

  @SubscribeMessage('addPlayer')
  handleAddPlayer(
    @MessageBody() data: { name: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.gameService.addPlayer(data.name, client.id);
    this.server.emit('gameStatus', this.gameService.getGameStatus());
  }

  @SubscribeMessage('addOfflinePlayer')
  handleAddOfflinePlayer(@MessageBody() data: { name: string }) {
    this.gameService.addPlayer(data.name);
    this.server.emit('gameStatus', this.gameService.getGameStatus());
  }

  @SubscribeMessage('getPersonnalCard')
  handleGeneratePersonalCard(
    @MessageBody() data: { playerId: string; theme: string },
  ) {
    this.gameService.generatePlayerPersonnalCard(data.playerId, data.theme);
    this.server.emit('gameStatus', this.gameService.getGameStatus());
  }

  @SubscribeMessage('goToRoundInstructions')
  handleRoundInstructions() {
    this.gameService.initializeRound();
    this.server.emit('gameStatus', this.gameService.getGameStatus());
  }

  @SubscribeMessage('gotToPlayerInstructions')
  handlePlayerInstructions() {
    this.gameService.setupNextPlayerTurn();
    this.server.emit('gameStatus', this.gameService.getGameStatus());
  }

  @SubscribeMessage('startPlayerTurn')
  handleStartPlayerTurn() {
    this.gameService.startTurn(this.server);
    this.server.emit('gameStatus', this.gameService.getGameStatus());
  }

  @SubscribeMessage('validate')
  handleValidate() {
    this.gameService.validateCard();
    this.server.emit('gameStatus', this.gameService.getGameStatus());
  }

  @SubscribeMessage('pass')
  handlePass() {
    this.gameService.passCard();
    this.server.emit('gameStatus', this.gameService.getGameStatus());
  }

  @SubscribeMessage('restartGame')
  handleRestartGame() {
    this.gameService.restartGame();
    this.server.emit('gameStatus', this.gameService.getGameStatus());
  }

  @SubscribeMessage('getThemeCapacities')
  handleGetThemeCapacities(client: Socket) {
    const capacities = this.gameService.getThemeCapacities();
    client.emit('themeCapacities', capacities);
  }

  @SubscribeMessage('getAllThemes')
  handleGetAllThemes(client: Socket) {
    const themes = this.gameService.getAllThemes();
    client.emit('themes', themes);
  }
}
