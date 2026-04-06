import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'https://daterabbit.smartlaunchhub.com',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      client.emit('error', { message: 'Unauthorized: no token provided' });
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify<{ id: string; email: string }>(
        token,
        { secret: this.configService.getOrThrow<string>('JWT_SECRET') },
      );

      client.data.userId = payload.id;
      await client.join(`user:${payload.id}`);
      this.logger.log(`Notifications WS connected: user ${payload.id}`);
    } catch {
      client.emit('error', { message: 'Unauthorized: invalid token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const userId = client.data?.userId;
    if (userId) {
      client.leave(`user:${userId}`);
    }
  }

  /**
   * Push a notification payload to all sockets of a given user.
   */
  sendToUser(userId: string, notification: Record<string, unknown>): void {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }
}
