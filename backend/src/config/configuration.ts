import * as Joi from 'joi';

/**
 * Environment variables validation schema using Joi.
 * Ensures all required environment variables are present and valid at application startup.
 */
export const validationSchema = Joi.object({
  // Node environment
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development')
    .description('Application environment'),

  // Server configuration
  PORT: Joi.number().port().default(3000).description('Server port number'),

  // CORS configuration
  ALLOWED_ORIGINS: Joi.string()
    .optional()
    .description(
      'Comma-separated list of allowed CORS origins (required in production)',
    )
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),

  // Game cleanup configuration
  GAME_INACTIVITY_THRESHOLD_MINUTES: Joi.number()
    .min(5)
    .max(1440)
    .default(60)
    .description(
      'Inactivity threshold in minutes before game cleanup (5-1440)',
    ),

  // Database configuration
  DATABASE_PATH: Joi.string()
    .default('./data/patpanic.db')
    .description('Path to SQLite database file'),

  DATABASE_BACKUP_ENABLED: Joi.boolean()
    .default(true)
    .description('Enable automatic database backups'),
});

/**
 * Configuration interface matching validated environment variables.
 */
export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  ALLOWED_ORIGINS?: string;
  GAME_INACTIVITY_THRESHOLD_MINUTES: number;
  DATABASE_PATH: string;
  DATABASE_BACKUP_ENABLED: boolean;
}
