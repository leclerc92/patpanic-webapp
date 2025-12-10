import { Injectable, Logger } from '@nestjs/common';
import { GameInstance } from '../models/GameInstance';
import { JsonImporterService } from './json-importer.service';
import { ROOMS } from '../models/gameConstants';

@Injectable()
export class GameService {
  private logger: Logger = new Logger('GameService');

  private games: Map<string, GameInstance> = new Map();

  constructor(private readonly jsonImporterService: JsonImporterService) {
    this.getGameInstance('CLEMICHES');
  }

  getGameInstance(roomId: string): GameInstance {
    if (!ROOMS.includes(roomId.toUpperCase())) {
      throw new Error('Salle invalide (utilisez CLEMICHES)');
    }

    const id = roomId.toUpperCase();

    if (!this.games.has(id)) {
      this.logger.log(`Création de l'instance de jeu : ${id}`);
      this.games.set(id, new GameInstance(id, this.jsonImporterService));
    }

    return this.games.get(id)!;
  }

  getRoomsInfo() {
    return ROOMS.map((id) => {
      const game = this.games.get(id);
      return {
        id,
        players: game ? game.getPlayers().length : 0,
        status: game ? game.getGameState() : 'LOBBY',
      };
    });
  }
}
