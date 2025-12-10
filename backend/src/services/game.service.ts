import { Injectable, Logger } from '@nestjs/common';
import { GameInstanceService } from './game-instance.service';
import { JsonImporterService } from './json-importer.service';
import { GameState, ROOMS } from '@patpanic/shared';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class GameService {
  private logger: Logger = new Logger('GameService');

  private games: Map<string, GameInstanceService> = new Map();

  constructor(private readonly jsonImporterService: JsonImporterService) {
    this.getGameInstance('CLEMICHES');
  }

  getGameInstance(roomId: string): GameInstanceService {
    if (!ROOMS.includes(roomId.toUpperCase())) {
      throw new Error('Salle invalide (utilisez CLEMICHES)');
    }

    const id = roomId.toUpperCase();

    if (!this.games.has(id)) {
      this.logger.log(`Création de l'instance de jeu : ${id}`);
      this.games.set(id, new GameInstanceService(id, this.jsonImporterService));
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

  @Cron(CronExpression.EVERY_6_HOURS)
  cleanupInactiveGames() {
    const inactiveThreshold = 6 * 60 * 60 * 1000; // 6 heures en ms
    const now = Date.now();
    let cleanedCount = 0;

    this.logger.log('🧹 Running cleanup check for inactive games...');

    for (const [roomId, game] of this.games.entries()) {
      // Condition de nettoyage :
      // 1. Plus aucun joueur connecté (optionnel selon ta logique socket)
      // 2. OU Jeu fini ET inactif depuis X temps
      // 3. OU Jeu n'importe quel état mais TOTALEMENT inactif depuis X temps (anti-oubli)

      if (this.isInactiveFor(game, inactiveThreshold)) {
        this.games.delete(roomId);
        this.logger.log(`🗑️ Deleted inactive room: ${roomId}`);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`✨ Cleanup finished. Removed ${cleanedCount} games.`);
    }
  }

  private isInactiveFor(game: GameInstanceService, threshold: number): boolean {
    if (!game.lastActivity) return true;
    return Date.now() - game.lastActivity > threshold;
  }
}
