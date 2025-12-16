import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { Socket } from 'socket.io';

/**
 * Custom Throttler Guard for WebSocket connections.
 * Extends the default ThrottlerGuard to work with Socket.IO instead of HTTP.
 */
@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  /**
   * Override canActivate to handle WebSocket context.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<Socket>();

    try {
      return await super.canActivate(context);
    } catch (error) {
      if (error instanceof ThrottlerException) {
        // Emit a custom error event to the client
        client.emit('error', 'Too many requests. Please slow down.');
        return false;
      }
      throw error;
    }
  }

  /**
   * Get the request tracker (IP address) from WebSocket handshake.
   */
  protected getTracker(req: Record<string, any>): Promise<string> {
    // For WebSocket, the request is actually the Socket
    const client = req as Socket;

    // Get IP from handshake (supports both direct connection and proxied)
    const ip =
      client.handshake.headers['x-forwarded-for'] ||
      client.handshake.address ||
      client.handshake.headers['x-real-ip'] ||
      'unknown';

    // Extract first IP if x-forwarded-for contains multiple IPs
    const tracker = Array.isArray(ip) ? ip[0] : ip.split(',')[0].trim();

    return Promise.resolve(tracker);
  }

  /**
   * Get the request object from ExecutionContext.
   * For WebSocket, this returns the Socket.IO client with a mock response.
   */
  protected getRequestResponse(context: ExecutionContext) {
    const client = context.switchToWs().getClient<Socket>();

    // Create a mock response object with required methods for ThrottlerGuard
    // These methods accept parameters but do nothing since WebSocket doesn't use HTTP headers

    const mockResponse = {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      header: (_name: string, _value: string | number) => mockResponse,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setHeader: (_name: string, _value: string | number) => mockResponse,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      getHeader: (_name: string) => undefined,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { req: client as any, res: mockResponse as any };
  }
}
