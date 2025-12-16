import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { WsExceptionFilter } from './filters/ws-exception.filter';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { EnvironmentVariables } from './config/configuration';
import { getCorsConfig } from './config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  const configService =
    app.get<ConfigService<EnvironmentVariables>>(ConfigService);

  // Get validated environment variables
  // Using getOrThrow ensures values exist (validated by Joi schema)
  const nodeEnv = configService.getOrThrow('NODE_ENV', { infer: true });
  const port = configService.getOrThrow('PORT', { infer: true });

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
  // Get the filter from DI container to ensure ConfigService is injected
  const wsExceptionFilter = app.get(WsExceptionFilter);
  app.useGlobalFilters(wsExceptionFilter);

  // CORS Configuration
  // Uses shared configuration to ensure consistency between HTTP and WebSocket layers
  app.enableCors(getCorsConfig(configService));

  if (nodeEnv === 'production') {
    logger.warn(
      'WARNING: Running in production mode. ALLOWED_ORIGINS is properly configured.',
    );
  }

  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on: http://0.0.0.0:${port}`);
  logger.log(`Environment: ${nodeEnv}`);
}

bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', err);
  process.exit(1);
});
