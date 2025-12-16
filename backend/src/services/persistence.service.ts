import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Database from 'better-sqlite3';
import { GameState, ICard, IPlayer } from '@patpanic/shared';
import { EnvironmentVariables } from '../config/configuration';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface for game snapshot stored in database
 */
export interface GameSnapshot {
  id: string;
  room_id: string;
  game_state: string;
  current_round: number;
  current_player_index: number;
  is_paused: boolean;
  timer: number;
  players: string; // JSON
  current_card: string | null; // JSON
  used_cards: string; // JSON
  cards: string; // JSON
  last_activity: number;
  created_at: number;
  updated_at: number;
}

/**
 * Interface for game session stored in database
 */
export interface GameSession {
  id: string;
  room_id: string;
  started_at: number;
  completed_at: number | null;
  status: 'COMPLETED' | 'ABANDONED';
  total_rounds: number;
  final_scores: string; // JSON
  player_count: number;
}

/**
 * Interface for card usage statistics
 */
export interface CardStats {
  id: string;
  card_title: string;
  card_category: string;
  round_number: number;
  times_validated: number;
  times_passed: number;
  total_appearances: number;
  average_time_to_validate: number;
  last_used: number;
}

/**
 * Service responsible for all database operations using SQLite.
 * Handles game snapshots for crash recovery, session history, and analytics.
 */
@Injectable()
export class PersistenceService implements OnModuleDestroy {
  private db: Database.Database;
  private logger = new Logger(PersistenceService.name);

  // Active session IDs tracked in memory for quick lookups
  private activeSessions: Map<string, string> = new Map();

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    this.initializeDatabase();
  }

  /**
   * Initialize SQLite database connection and schema
   */
  private initializeDatabase(): void {
    const dbPath =
      this.configService.get('DATABASE_PATH') || './data/patpanic.db';

    // Ensure data directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      this.logger.log(`Created database directory: ${dbDir}`);
    }

    // Open database connection
    this.db = new Database(dbPath);

    // Enable WAL mode for better concurrency and crash safety
    this.db.pragma('journal_mode = WAL');

    this.logger.log(`Database initialized at: ${dbPath} (WAL mode enabled)`);

    // Initialize schema
    this.initializeSchema();
  }

  /**
   * Create database tables and indexes if they don't exist
   */
  private initializeSchema(): void {
    this.db.exec(`
      -- Active game snapshots table
      CREATE TABLE IF NOT EXISTS game_snapshots (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL,
        game_state TEXT NOT NULL,
        current_round INTEGER NOT NULL,
        current_player_index INTEGER NOT NULL,
        is_paused BOOLEAN NOT NULL,
        timer INTEGER NOT NULL,
        players TEXT NOT NULL,
        current_card TEXT,
        used_cards TEXT NOT NULL,
        cards TEXT NOT NULL,
        last_activity INTEGER NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_game_snapshots_room_id ON game_snapshots(room_id);
      CREATE INDEX IF NOT EXISTS idx_game_snapshots_updated_at ON game_snapshots(updated_at);

      -- Game sessions table
      CREATE TABLE IF NOT EXISTS game_sessions (
        id TEXT PRIMARY KEY,
        room_id TEXT NOT NULL,
        started_at INTEGER NOT NULL,
        completed_at INTEGER,
        status TEXT NOT NULL,
        total_rounds INTEGER NOT NULL,
        final_scores TEXT NOT NULL,
        player_count INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_game_sessions_room_id ON game_sessions(room_id);
      CREATE INDEX IF NOT EXISTS idx_game_sessions_started_at ON game_sessions(started_at);
      CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);

      -- Game rounds table
      CREATE TABLE IF NOT EXISTS game_rounds (
        id TEXT PRIMARY KEY,
        game_session_id TEXT NOT NULL,
        round_number INTEGER NOT NULL,
        started_at INTEGER NOT NULL,
        completed_at INTEGER NOT NULL,
        player_scores TEXT NOT NULL,
        FOREIGN KEY (game_session_id) REFERENCES game_sessions(id)
      );

      CREATE INDEX IF NOT EXISTS idx_game_rounds_session_id ON game_rounds(game_session_id);
      CREATE INDEX IF NOT EXISTS idx_game_rounds_round_number ON game_rounds(round_number);

      -- Card usage statistics table
      CREATE TABLE IF NOT EXISTS card_usage_stats (
        id TEXT PRIMARY KEY,
        card_title TEXT NOT NULL,
        card_category TEXT NOT NULL,
        round_number INTEGER NOT NULL,
        times_validated INTEGER DEFAULT 0,
        times_passed INTEGER DEFAULT 0,
        total_appearances INTEGER DEFAULT 0,
        average_time_to_validate REAL DEFAULT 0,
        last_used INTEGER NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_card_usage_unique
        ON card_usage_stats(card_title, round_number);
      CREATE INDEX IF NOT EXISTS idx_card_usage_category ON card_usage_stats(card_category);
      CREATE INDEX IF NOT EXISTS idx_card_usage_validated ON card_usage_stats(times_validated);
    `);

    this.logger.log('Database schema initialized successfully');
  }

  /**
   * Clean up database connection on module destroy
   */
  onModuleDestroy() {
    if (this.db) {
      this.db.close();
      this.logger.log('Database connection closed');
    }
  }

  // ===========================================================================
  // GAME SNAPSHOT OPERATIONS (for crash recovery)
  // ===========================================================================

  /**
   * Save current game state snapshot
   * Uses INSERT OR REPLACE to handle both new and existing snapshots
   */
  saveGameSnapshot(snapshot: {
    roomId: string;
    gameState: GameState;
    currentRound: number;
    currentPlayerIndex: number;
    isPaused: boolean;
    timer: number;
    players: IPlayer[];
    currentCard: ICard | undefined;
    usedCards: ICard[];
    cards: ICard[];
    lastActivity: number;
  }): void {
    const now = Date.now();

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO game_snapshots (
        id, room_id, game_state, current_round, current_player_index,
        is_paused, timer, players, current_card, used_cards, cards,
        last_activity, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        COALESCE((SELECT created_at FROM game_snapshots WHERE id = ?), ?),
        ?
      )
    `);

    stmt.run(
      snapshot.roomId,
      snapshot.roomId,
      snapshot.gameState,
      snapshot.currentRound,
      snapshot.currentPlayerIndex,
      snapshot.isPaused ? 1 : 0,
      snapshot.timer,
      JSON.stringify(snapshot.players),
      snapshot.currentCard ? JSON.stringify(snapshot.currentCard) : null,
      JSON.stringify(snapshot.usedCards),
      JSON.stringify(snapshot.cards),
      snapshot.lastActivity,
      snapshot.roomId,
      now,
      now,
    );

    this.logger.debug(
      `Saved snapshot for room ${snapshot.roomId} (state: ${snapshot.gameState})`,
    );
  }

  /**
   * Get game snapshot for a specific room
   */
  getGameSnapshot(roomId: string): GameSnapshot | null {
    const stmt = this.db.prepare(
      'SELECT * FROM game_snapshots WHERE room_id = ?',
    );
    return stmt.get(roomId) as GameSnapshot | null;
  }

  /**
   * Get all active games (for recovery on server restart)
   * Returns snapshots updated in the last 24 hours and not in GAME_END state
   */
  getActiveGames(): GameSnapshot[] {
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

    const stmt = this.db.prepare(`
      SELECT * FROM game_snapshots
      WHERE updated_at > ?
        AND game_state != 'GAME_END'
      ORDER BY updated_at DESC
    `);

    return stmt.all(twentyFourHoursAgo) as GameSnapshot[];
  }

  /**
   * Delete game snapshot (called when room is closed)
   */
  deleteGameSnapshot(roomId: string): void {
    const stmt = this.db.prepare('DELETE FROM game_snapshots WHERE room_id = ?');
    stmt.run(roomId);
    this.logger.debug(`Deleted snapshot for room ${roomId}`);
  }

  // ===========================================================================
  // GAME SESSION OPERATIONS (for history tracking)
  // ===========================================================================

  /**
   * Start a new game session
   * Called when first round begins
   */
  startGameSession(roomId: string, playerCount: number): string {
    const sessionId = crypto.randomUUID();
    const now = Date.now();

    const stmt = this.db.prepare(`
      INSERT INTO game_sessions (
        id, room_id, started_at, completed_at, status,
        total_rounds, final_scores, player_count
      ) VALUES (?, ?, ?, NULL, 'COMPLETED', 0, '{}', ?)
    `);

    stmt.run(sessionId, roomId, now, playerCount);

    // Track active session for this room
    this.activeSessions.set(roomId, sessionId);

    this.logger.log(
      `Started game session ${sessionId} for room ${roomId} with ${playerCount} players`,
    );

    return sessionId;
  }

  /**
   * Complete a game session
   * Called when game is restarted or abandoned
   */
  completeGameSession(
    roomId: string,
    finalScores: Record<string, number>,
    totalRounds: number,
  ): void {
    const sessionId = this.activeSessions.get(roomId);
    if (!sessionId) {
      this.logger.warn(
        `No active session found for room ${roomId}, skipping completion`,
      );
      return;
    }

    const now = Date.now();

    const stmt = this.db.prepare(`
      UPDATE game_sessions
      SET completed_at = ?,
          status = 'COMPLETED',
          total_rounds = ?,
          final_scores = ?
      WHERE id = ?
    `);

    stmt.run(now, totalRounds, JSON.stringify(finalScores), sessionId);

    // Remove from active sessions
    this.activeSessions.delete(roomId);

    this.logger.log(
      `Completed game session ${sessionId} for room ${roomId} (${totalRounds} rounds)`,
    );
  }

  /**
   * Mark a game as abandoned (cleanup via cron)
   */
  markGameAbandoned(roomId: string): void {
    const sessionId = this.activeSessions.get(roomId);
    if (!sessionId) {
      // Try to find the most recent session for this room
      const findStmt = this.db.prepare(`
        SELECT id FROM game_sessions
        WHERE room_id = ?
          AND completed_at IS NULL
        ORDER BY started_at DESC
        LIMIT 1
      `);
      const session = findStmt.get(roomId) as { id: string } | undefined;

      if (!session) {
        this.logger.debug(
          `No active session to abandon for room ${roomId}`,
        );
        return;
      }
    }

    const now = Date.now();

    const stmt = this.db.prepare(`
      UPDATE game_sessions
      SET completed_at = ?,
          status = 'ABANDONED'
      WHERE room_id = ?
        AND completed_at IS NULL
    `);

    stmt.run(now, roomId);

    // Remove from active sessions
    this.activeSessions.delete(roomId);

    this.logger.log(`Marked game session as abandoned for room ${roomId}`);
  }

  /**
   * Save round completion data
   */
  saveRoundCompletion(
    roomId: string,
    roundNumber: number,
    playerScores: Record<string, number>,
  ): void {
    const sessionId = this.activeSessions.get(roomId);
    if (!sessionId) {
      this.logger.warn(
        `No active session for room ${roomId}, cannot save round completion`,
      );
      return;
    }

    const roundId = crypto.randomUUID();
    const now = Date.now();

    const stmt = this.db.prepare(`
      INSERT INTO game_rounds (
        id, game_session_id, round_number, started_at, completed_at, player_scores
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    // Use current time as both started_at and completed_at for simplicity
    // In future, could track actual round start time
    stmt.run(
      roundId,
      sessionId,
      roundNumber,
      now,
      now,
      JSON.stringify(playerScores),
    );

    this.logger.debug(
      `Saved round ${roundNumber} completion for session ${sessionId}`,
    );
  }

  // ===========================================================================
  // CARD USAGE STATISTICS (for analytics)
  // ===========================================================================

  /**
   * Record a card validation event
   */
  recordCardValidation(
    card: ICard,
    roundNumber: number,
    timeElapsed: number,
  ): void {
    // Check if record exists
    const existingStmt = this.db.prepare(`
      SELECT * FROM card_usage_stats
      WHERE card_title = ? AND round_number = ?
    `);

    const existing = existingStmt.get(card.title, roundNumber) as
      | CardStats
      | undefined;

    const now = Date.now();

    if (existing) {
      // Update existing record
      const newValidatedCount = existing.times_validated + 1;
      const newTotalAppearances = existing.total_appearances + 1;
      const newAverage =
        (existing.average_time_to_validate * existing.times_validated +
          timeElapsed) /
        newValidatedCount;

      const updateStmt = this.db.prepare(`
        UPDATE card_usage_stats
        SET times_validated = ?,
            total_appearances = ?,
            average_time_to_validate = ?,
            last_used = ?
        WHERE card_title = ? AND round_number = ?
      `);

      updateStmt.run(
        newValidatedCount,
        newTotalAppearances,
        newAverage,
        now,
        card.title,
        roundNumber,
      );
    } else {
      // Create new record
      const insertStmt = this.db.prepare(`
        INSERT INTO card_usage_stats (
          id, card_title, card_category, round_number,
          times_validated, times_passed, total_appearances,
          average_time_to_validate, last_used
        ) VALUES (?, ?, ?, ?, 1, 0, 1, ?, ?)
      `);

      insertStmt.run(
        crypto.randomUUID(),
        card.title,
        card.category,
        roundNumber,
        timeElapsed,
        now,
      );
    }

    this.logger.debug(
      `Recorded validation for card "${card.title}" in round ${roundNumber}`,
    );
  }

  /**
   * Record a card pass event
   */
  recordCardPass(card: ICard, roundNumber: number): void {
    // Check if record exists
    const existingStmt = this.db.prepare(`
      SELECT * FROM card_usage_stats
      WHERE card_title = ? AND round_number = ?
    `);

    const existing = existingStmt.get(card.title, roundNumber) as
      | CardStats
      | undefined;

    const now = Date.now();

    if (existing) {
      // Update existing record
      const updateStmt = this.db.prepare(`
        UPDATE card_usage_stats
        SET times_passed = times_passed + 1,
            total_appearances = total_appearances + 1,
            last_used = ?
        WHERE card_title = ? AND round_number = ?
      `);

      updateStmt.run(now, card.title, roundNumber);
    } else {
      // Create new record
      const insertStmt = this.db.prepare(`
        INSERT INTO card_usage_stats (
          id, card_title, card_category, round_number,
          times_validated, times_passed, total_appearances,
          average_time_to_validate, last_used
        ) VALUES (?, ?, ?, ?, 0, 1, 1, 0, ?)
      `);

      insertStmt.run(
        crypto.randomUUID(),
        card.title,
        card.category,
        roundNumber,
        now,
      );
    }

    this.logger.debug(
      `Recorded pass for card "${card.title}" in round ${roundNumber}`,
    );
  }

  /**
   * Get card statistics (for analytics/dashboard)
   */
  getCardStats(options?: {
    category?: string;
    roundNumber?: number;
    limit?: number;
  }): CardStats[] {
    let query = 'SELECT * FROM card_usage_stats WHERE 1=1';
    const params: any[] = [];

    if (options?.category) {
      query += ' AND card_category = ?';
      params.push(options.category);
    }

    if (options?.roundNumber) {
      query += ' AND round_number = ?';
      params.push(options.roundNumber);
    }

    query += ' ORDER BY times_validated DESC';

    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as CardStats[];
  }

  /**
   * Get database statistics for monitoring
   */
  getDbStats(): {
    snapshotCount: number;
    sessionCount: number;
    completedGames: number;
    abandonedGames: number;
    cardStatsCount: number;
  } {
    const snapshotCount = this.db
      .prepare('SELECT COUNT(*) as count FROM game_snapshots')
      .get() as { count: number };

    const sessionCount = this.db
      .prepare('SELECT COUNT(*) as count FROM game_sessions')
      .get() as { count: number };

    const completedGames = this.db
      .prepare(
        "SELECT COUNT(*) as count FROM game_sessions WHERE status = 'COMPLETED'",
      )
      .get() as { count: number };

    const abandonedGames = this.db
      .prepare(
        "SELECT COUNT(*) as count FROM game_sessions WHERE status = 'ABANDONED'",
      )
      .get() as { count: number };

    const cardStatsCount = this.db
      .prepare('SELECT COUNT(*) as count FROM card_usage_stats')
      .get() as { count: number };

    return {
      snapshotCount: snapshotCount.count,
      sessionCount: sessionCount.count,
      completedGames: completedGames.count,
      abandonedGames: abandonedGames.count,
      cardStatsCount: cardStatsCount.count,
    };
  }
}
