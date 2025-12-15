import { IGameStatus } from '@patpanic/shared';

/**
 * Interface abstraite pour émettre des événements de jeu.
 * Permet de découpler la logique métier de l'implémentation Socket.IO.
 */
export interface IGameEventEmitter {
  /**
   * Émet une mise à jour du timer vers tous les clients de la room
   * @param roomId - Identifiant de la room
   * @param timer - Temps restant en secondes
   */
  emitTimerUpdate(roomId: string, timer: number): void;

  /**
   * Émet le statut complet du jeu vers tous les clients de la room
   * @param roomId - Identifiant de la room
   * @param gameStatus - Statut du jeu
   */
  emitGameStatus(roomId: string, gameStatus: IGameStatus): void;
}