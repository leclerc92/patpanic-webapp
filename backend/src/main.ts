import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { WsExceptionFilter } from './filters/ws-exception.filter';
import { Logger } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

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
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : [
        'http://localhost:5173',
        // Development only: Allow local network IPs
        // TODO: Remove these regex in production and use specific domains
        /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/,
        /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:5173$/,
      ];

  if (process.env.NODE_ENV === 'production') {
    logger.warn(
      'WARNING: Running in production mode. Ensure ALLOWED_ORIGINS is properly configured.',
    );
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on: http://0.0.0.0:${port}`);
}

bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', err);
  process.exit(1);
});
