import { Server } from 'socket.io';
import { IGameStatus } from '@patpanic/shared';
import { IGameEventEmitter } from '../interfaces/game-event-emitter.interface';

/**
 * Implémentation Socket.IO de l'interface IGameEventEmitter.
 * Encapsule la logique d'émission d'événements via Socket.IO.
 */
export class SocketIOGameEventEmitter implements IGameEventEmitter {
  constructor(private readonly server: Server) {}

  emitTimerUpdate(roomId: string, timer: number): void {
    this.server.to(roomId).emit('timerUpdate', timer);
  }

  emitGameStatus(roomId: string, gameStatus: IGameStatus): void {
    this.server.to(roomId).emit('gameStatus', gameStatus);
  }
}