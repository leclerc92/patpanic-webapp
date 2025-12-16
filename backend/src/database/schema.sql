-- PatPanic Backend Database Schema
-- SQLite database for game state persistence, session history, and analytics
--
-- This file serves as documentation. The actual schema is created programmatically
-- by PersistenceService.initializeSchema() to ensure consistency.

-- ==============================================================================
-- ACTIVE GAME STATE - For crash recovery
-- ==============================================================================

-- Stores current state of active games for recovery after server restart
CREATE TABLE IF NOT EXISTS game_snapshots (
  id TEXT PRIMARY KEY,                  -- roomId (e.g., 'CLEMICHES')
  room_id TEXT NOT NULL,                -- Room identifier
  game_state TEXT NOT NULL,             -- GameState enum (LOBBY, PLAYING, etc.)
  current_round INTEGER NOT NULL,       -- 1, 2, or 3
  current_player_index INTEGER NOT NULL,-- Index in players array
  is_paused BOOLEAN NOT NULL,           -- Game paused state
  timer INTEGER NOT NULL,               -- Remaining time in seconds
  players TEXT NOT NULL,                -- JSON serialized IPlayer[]
  current_card TEXT,                    -- JSON serialized ICard (nullable)
  used_cards TEXT NOT NULL,             -- JSON serialized ICard[]
  cards TEXT NOT NULL,                  -- JSON serialized ICard[] (remaining deck)
  last_activity INTEGER NOT NULL,       -- Unix timestamp (milliseconds)
  created_at INTEGER NOT NULL,          -- Unix timestamp (milliseconds)
  updated_at INTEGER NOT NULL           -- Unix timestamp (milliseconds)
);

CREATE INDEX IF NOT EXISTS idx_game_snapshots_room_id ON game_snapshots(room_id);
CREATE INDEX IF NOT EXISTS idx_game_snapshots_updated_at ON game_snapshots(updated_at);

-- ==============================================================================
-- GAME HISTORY - Completed and abandoned games
-- ==============================================================================

-- Stores completed or abandoned game sessions
CREATE TABLE IF NOT EXISTS game_sessions (
  id TEXT PRIMARY KEY,                  -- UUID
  room_id TEXT NOT NULL,                -- Room identifier
  started_at INTEGER NOT NULL,          -- Unix timestamp (milliseconds)
  completed_at INTEGER,                 -- Unix timestamp (milliseconds, nullable)
  status TEXT NOT NULL,                 -- 'COMPLETED' or 'ABANDONED'
  total_rounds INTEGER NOT NULL,        -- Number of rounds played
  final_scores TEXT NOT NULL,           -- JSON: { playerId: score }
  player_count INTEGER NOT NULL         -- Number of players in game
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_room_id ON game_sessions(room_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_started_at ON game_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);

-- Stores individual round results within a game session
CREATE TABLE IF NOT EXISTS game_rounds (
  id TEXT PRIMARY KEY,                  -- UUID
  game_session_id TEXT NOT NULL,        -- Foreign key to game_sessions.id
  round_number INTEGER NOT NULL,        -- 1, 2, or 3
  started_at INTEGER NOT NULL,          -- Unix timestamp (milliseconds)
  completed_at INTEGER NOT NULL,        -- Unix timestamp (milliseconds)
  player_scores TEXT NOT NULL,          -- JSON: { playerId: roundScore }
  FOREIGN KEY (game_session_id) REFERENCES game_sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_game_rounds_session_id ON game_rounds(game_session_id);
CREATE INDEX IF NOT EXISTS idx_game_rounds_round_number ON game_rounds(round_number);

-- ==============================================================================
-- ANALYTICS - Card usage statistics
-- ==============================================================================

-- Aggregates card usage for game balance analysis
CREATE TABLE IF NOT EXISTS card_usage_stats (
  id TEXT PRIMARY KEY,                  -- UUID
  card_title TEXT NOT NULL,             -- Card title
  card_category TEXT NOT NULL,          -- Card category
  round_number INTEGER NOT NULL,        -- 1, 2, or 3
  times_validated INTEGER DEFAULT 0,   -- Number of times validated
  times_passed INTEGER DEFAULT 0,       -- Number of times passed
  total_appearances INTEGER DEFAULT 0,  -- Total times card appeared
  average_time_to_validate REAL DEFAULT 0, -- Average seconds to validate
  last_used INTEGER NOT NULL            -- Unix timestamp (milliseconds)
);

-- Unique constraint: one record per card per round
CREATE UNIQUE INDEX IF NOT EXISTS idx_card_usage_unique
  ON card_usage_stats(card_title, round_number);

CREATE INDEX IF NOT EXISTS idx_card_usage_category ON card_usage_stats(card_category);
CREATE INDEX IF NOT EXISTS idx_card_usage_validated ON card_usage_stats(times_validated);

-- ==============================================================================
-- FUTURE: Player profiles (not implemented yet)
-- ==============================================================================

-- CREATE TABLE IF NOT EXISTS player_profiles (
--   id TEXT PRIMARY KEY,
--   name TEXT NOT NULL,
--   icon TEXT NOT NULL,
--   games_played INTEGER DEFAULT 0,
--   total_score INTEGER DEFAULT 0,
--   average_score REAL DEFAULT 0,
--   best_score INTEGER DEFAULT 0,
--   last_played_at INTEGER NOT NULL,
--   created_at INTEGER NOT NULL
-- );
--
-- CREATE TABLE IF NOT EXISTS player_game_participation (
--   id TEXT PRIMARY KEY,
--   player_profile_id TEXT NOT NULL,
--   game_session_id TEXT NOT NULL,
--   final_score INTEGER NOT NULL,
--   rank INTEGER NOT NULL,
--   played_at INTEGER NOT NULL,
--   FOREIGN KEY (player_profile_id) REFERENCES player_profiles(id),
--   FOREIGN KEY (game_session_id) REFERENCES game_sessions(id)
-- );

-- ==============================================================================
-- QUERIES FOR ANALYTICS (Examples)
-- ==============================================================================

-- Top 10 most validated cards across all rounds
-- SELECT card_title, card_category, SUM(times_validated) as total_validated
-- FROM card_usage_stats
-- GROUP BY card_title, card_category
-- ORDER BY total_validated DESC
-- LIMIT 10;

-- Cards with highest pass rate (indicates difficulty)
-- SELECT card_title, card_category, round_number,
--        times_passed, times_validated,
--        ROUND(100.0 * times_passed / (times_passed + times_validated), 2) as pass_rate_percent
-- FROM card_usage_stats
-- WHERE (times_passed + times_validated) > 5
-- ORDER BY pass_rate_percent DESC
-- LIMIT 20;

-- Average game duration by room
-- SELECT room_id,
--        COUNT(*) as total_games,
--        AVG((completed_at - started_at) / 1000 / 60) as avg_duration_minutes
-- FROM game_sessions
-- WHERE status = 'COMPLETED'
-- GROUP BY room_id;
