import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { WsExceptionFilter } from './filters/ws-exception.filter';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { EnvironmentVariables } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService = app.get<ConfigService<EnvironmentVariables>>(ConfigService);

  // Get validated environment variables
  // Using getOrThrow ensures values exist (validated by Joi schema)
  const nodeEnv = configService.getOrThrow('NODE_ENV', { infer: true });
  const port = configService.getOrThrow('PORT', { infer: true });
  const allowedOriginsEnv = configService.get('ALLOWED_ORIGINS', { infer: true });

  // Security headers with Helmet
  app.use(
    helmet({
      // Disable crossOriginResourcePolicy for WebSocket compatibility
      crossOriginResourcePolicy: false,
      // Content Security Policy
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'", 'ws:', 'wss:'],
        },
      },
    }),
  );

  // Apply global exception filter for WebSocket
  app.useGlobalFilters(new WsExceptionFilter());

  // CORS Configuration
  // SECURITY WARNING: In production, use ALLOWED_ORIGINS environment variable
  // with specific domains instead of regex patterns
  const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',')
    : [
        'http://localhost:5173',
        // Development only: Allow local network IPs
        // TODO: Remove these regex in production and use specific domains
        /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/,
        /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:5173$/,
      ];

  if (nodeEnv === 'production') {
    logger.warn(
      'WARNING: Running in production mode. ALLOWED_ORIGINS is properly configured.',
    );
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on: http://0.0.0.0:${port}`);
  logger.log(`Environment: ${nodeEnv}`);
}

bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', err);
  process.exit(1);
});
