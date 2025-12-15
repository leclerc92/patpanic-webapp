import {
  Catch,
  ArgumentsHost,
  Logger,
  ExceptionFilter,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WsExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('WsExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    const data = host.switchToWs().getData();

    // Log complet côté serveur pour debugging
    this.logger.error(
      `WebSocket Exception - Client: ${client.id}, Data: ${JSON.stringify(data)}`,
    );

    if (exception instanceof Error) {
      this.logger.error(`Error: ${exception.message}`);
      if (process.env.NODE_ENV !== 'production') {
        this.logger.error(`Stack: ${exception.stack}`);
      }
    }

    // Message sanitisé pour le client
    const errorMessage = this.getClientErrorMessage(exception);

    client.emit('error', errorMessage);
  }

  private getClientErrorMessage(exception: unknown): string {
    // En production, on masque les détails techniques
    const isProduction = process.env.NODE_ENV === 'production';

    if (exception instanceof WsException) {
      // Les WsException sont des erreurs "métier" safe à exposer
      return exception.message;
    }

    if (exception instanceof Error) {
      // En développement, on expose le message
      // En production, message générique
      if (isProduction) {
        return 'Une erreur est survenue';
      }
      return exception.message;
    }

    // Erreur inconnue
    return isProduction
      ? 'Une erreur est survenue'
      : `Erreur inconnue: ${String(exception)}`;
  }
}
