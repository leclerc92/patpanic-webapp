import { Injectable } from '@nestjs/common';
import { IPlayer } from '../types/IPlayer';

@Injectable()
export class GameService {
  private players: IPlayer[] = [];

  addPlayer(name: string) {
    if (name === '' || name.length < 2) {
      throw new Error('Invalid game player name');
    }

    const player: IPlayer = {
      id: crypto.randomUUID(),
      icon: '🕺',
      name: name,
      isCurrentPlayer: false,
      isActive: true,
      isMainPlayer: false,
      score: 0,
      turnScore: 0,
      roundScore: 0,
    };

    this.players.push(player);
    return player;
  }

  getAllPlayers() {
    return this.players;
  }
}
