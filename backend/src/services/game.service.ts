import { Injectable, Logger } from '@nestjs/common';
import { GameInstanceService } from './game-instance.service';
import { JsonImporterService } from './json-importer.service';
import { ROOMS } from '@patpanic/shared';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../config/configuration';

@Injectable()
export class GameService {
  private logger: Logger = new Logger('GameService');

  private games: Map<string, GameInstanceService> = new Map();
  private inactivityThresholdMs: number;

  constructor(
    private readonly jsonImporterService: JsonImporterService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    this.getGameInstance('CLEMICHES');

    // Get inactivity threshold from environment (in minutes, convert to ms)
    const thresholdMinutes = this.configService.getOrThrow(
      'GAME_INACTIVITY_THRESHOLD_MINUTES',
      { infer: true },
    );
    this.inactivityThresholdMs = thresholdMinutes * 60 * 1000;

    this.logger.log(
      `Game cleanup configured: ${thresholdMinutes} minutes inactivity threshold`,
    );
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

  @Cron(CronExpression.EVERY_HOUR)
  cleanupInactiveGames() {
    let cleanedCount = 0;

    this.logger.log('Running cleanup check for inactive games');

    for (const [roomId, game] of this.games.entries()) {
      // Cleanup conditions:
      // 1. No players connected (optional depending on socket logic)
      // 2. OR Game finished AND inactive for X time
      // 3. OR Game in any state but COMPLETELY inactive for X time (anti-forget)

      if (this.isInactiveFor(game, this.inactivityThresholdMs)) {
        // Clean up timers before deleting
        game.cleanup();
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
    const game = this.games.get(id);
    if (game) {
      this.logger.log(`Resetting room: ${id}`);
      // Clean up timers before deleting
      game.cleanup();
      this.games.delete(id);
    }
  }
}
