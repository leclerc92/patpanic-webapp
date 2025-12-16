import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { EnvironmentVariables } from './configuration';

/**
 * Development-only CORS patterns for local network access.
 * WARNING: These should NEVER be used in production. Use ALLOWED_ORIGINS env var instead.
 */
export const DEV_CORS_PATTERNS = [
  'http://localhost:5173',
  /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/,
  /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:5173$/,
];

/**
 * Get CORS allowed origins from environment or use development defaults.
 */
export function getAllowedOrigins(allowedOriginsEnv?: string) {
  return allowedOriginsEnv ? allowedOriginsEnv.split(',') : DEV_CORS_PATTERNS;
}

/**
 * Get CORS configuration based on environment variables.
 * This ensures consistent CORS settings across HTTP and WebSocket layers.
 */
export function getCorsConfig(
  configService: ConfigService<EnvironmentVariables>,
): CorsOptions {
  const allowedOriginsEnv = configService.get('ALLOWED_ORIGINS', {
    infer: true,
  });

  return {
    origin: getAllowedOrigins(allowedOriginsEnv),
    credentials: true,
  };
}
