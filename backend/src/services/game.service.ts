import { Injectable, Logger } from '@nestjs/common';
import { GameInstanceService } from './game-instance.service';
import { JsonImporterService } from './json-importer.service';
import { ROOMS } from '@patpanic/shared';
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

    const game = this.games.get(id);
    if (!game) {
      throw new Error(`Failed to retrieve game instance for room: ${id}`);
    }
    return game;
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
    const inactiveThreshold = 6 * 60 * 60 * 1000; // 6 hours in ms
    let cleanedCount = 0;

    this.logger.log('Running cleanup check for inactive games');

    for (const [roomId, game] of this.games.entries()) {
      // Cleanup conditions:
      // 1. No players connected (optional depending on socket logic)
      // 2. OR Game finished AND inactive for X time
      // 3. OR Game in any state but COMPLETELY inactive for X time (anti-forget)

      if (this.isInactiveFor(game, inactiveThreshold)) {
        this.games.delete(roomId);
        this.logger.log(`Deleted inactive room: ${roomId}`);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`Cleanup finished - Removed ${cleanedCount} games`);
    }
  }

  private isInactiveFor(game: GameInstanceService, threshold: number): boolean {
    if (!game.lastActivity) return true;
    return Date.now() - game.lastActivity > threshold;
  }

  getAllThemes() {
    return this.jsonImporterService.getAllThemes();
  }

  getThemeCapacities() {
    return this.jsonImporterService.getRound3Capacities();
  }

  resetGameInstance(roomId: string): void {
    const id = roomId.toUpperCase();
    if (this.games.has(id)) {
      this.logger.log(`Resetting room: ${id}`);
      this.games.delete(id);
    }
  }
}
