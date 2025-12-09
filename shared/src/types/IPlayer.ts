import type { ICard } from './ICard.js';

export interface IPlayer {
  id: string;
  name: string;
  icon: string;
  score: number;
  roundScore: number;
  turnScore: number;
  isMainPlayer: boolean;
  isCurrentPlayer: boolean;
  isActive: boolean;
  masterNumber: number;
  socketId: string | undefined;
  personnalCard: ICard | undefined;
  remainingTurns:number;
}
