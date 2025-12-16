import {
  Catch,
  ArgumentsHost,
  Logger,
  ExceptionFilter,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { EnvironmentVariables } from '../config/configuration';

@Catch()
@Injectable()
export class WsExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('WsExceptionFilter');
  private readonly isProduction: boolean;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    // Cache NODE_ENV value for performance
    this.isProduction =
      this.configService.get('NODE_ENV', { infer: true }) === 'production';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    const data: unknown = host.switchToWs().getData();

    // Log with sanitized data to avoid exposing sensitive information
    this.logger.error(
      `WebSocket Exception - Client: ${client.id}, Event: ${this.sanitizeEventData(data)}`,
    );

    if (exception instanceof Error) {
      this.logger.error(`Error: ${exception.message}`);
      if (!this.isProduction) {
        this.logger.error(`Stack: ${exception.stack}`);
      }
    }

    // Message sanitisé pour le client
    const errorMessage = this.getClientErrorMessage(exception);

    client.emit('error', errorMessage);
  }

  /**
   * Sanitize event data for logging to avoid exposing sensitive information.
   * Only logs event type and basic metadata, not full payloads.
   */
  private sanitizeEventData(data: unknown): string {
    if (typeof data === 'object' && data !== null) {
      // Only log the event type, not the full payload
      return 'object';
    }
    if (typeof data === 'string') {
      return `string(${data.length} chars)`;
    }
    return typeof data;
  }

  private getClientErrorMessage(exception: unknown): string {
    if (exception instanceof WsException) {
      // Les WsException sont des erreurs "métier" safe à exposer
      return exception.message;
    }

    if (exception instanceof Error) {
      // En développement, on expose le message
      // En production, message générique
      if (this.isProduction) {
        return 'Une erreur est survenue';
      }
      return exception.message;
    }

    // Erreur inconnue
    return this.isProduction
      ? 'Une erreur est survenue'
      : `Erreur inconnue: ${String(exception)}`;
  }
}
