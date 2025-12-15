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
  PORT: Joi.number()
    .port()
    .default(3000)
    .description('Server port number'),

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
});

/**
 * Configuration interface matching validated environment variables.
 */
export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  ALLOWED_ORIGINS?: string;
}