import { Global, Module } from '@nestjs/common';
import { PersistenceService } from '../services/persistence.service';

/**
 * Persistence Module
 *
 * This module provides database persistence capabilities across the application.
 * Marked as @Global() to make PersistenceService available to all modules
 * without explicit imports.
 *
 * Features:
 * - SQLite database with WAL mode for crash safety
 * - Game state snapshots for crash recovery
 * - Game session history tracking
 * - Card usage statistics for analytics
 */
@Global()
@Module({
  providers: [PersistenceService],
  exports: [PersistenceService],
})
export class PersistenceModule {}
