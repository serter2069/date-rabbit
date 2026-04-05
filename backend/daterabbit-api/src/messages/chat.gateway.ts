import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { MessagesService } from './messages.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'https://daterabbit.smartlaunchhub.com',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly messagesService: MessagesService,
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

      const user = await this.usersService.findByIdWithDeleted(payload.id);

      if (!user || !user.isActive || user.deletedAt) {
        client.emit('error', {
          message: 'Unauthorized: user not found or inactive',
        });
        client.disconnect();
        return;
      }

      client.data.userId = user.id;
      client.data.user = { id: user.id, email: user.email };

      // Join personal room so messages can be pushed to this user
      await client.join(`user:${user.id}`);
    } catch {
      client.emit('error', { message: 'Unauthorized: invalid token' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    // No cleanup needed — socket.io removes the client from all rooms automatically
    const userId = client.data?.userId;
    if (userId) {
      client.leave(`user:${userId}`);
    }
  }

  /**
   * Client joins a conversation room so they receive real-time messages.
   * Payload: { otherUserId: string }
   */
  @SubscribeMessage('join-conversation')
  async handleJoinConversation(
    @MessageBody() data: { otherUserId: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId: string | undefined = client.data?.userId;
    if (!userId) {
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect();
      return;
    }

    const [id1, id2] = [userId, data.otherUserId].sort();
    const roomId = `conv:${id1}:${id2}`;
    await client.join(roomId);
    client.emit('joined-conversation', { roomId });
  }

  /**
   * Client sends a message via WebSocket.
   * Payload: { receiverId: string; content: string }
   */
  @SubscribeMessage('send-message')
  async handleSendMessage(
    @MessageBody() data: { receiverId: string; content: string },
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    const userId: string | undefined = client.data?.userId;
    if (!userId) {
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect();
      return;
    }

    if (!data.content?.trim() || data.content.length > 5000) {
      client.emit('error', { message: 'Invalid message content' });
      return;
    }

    try {
      const message = await this.messagesService.sendMessage(
        userId,
        data.receiverId,
        data.content.trim(),
      );

      const payload = {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt,
      };

      // Emit to conversation room (both participants)
      const [id1, id2] = [userId, data.receiverId].sort();
      const roomId = `conv:${id1}:${id2}`;
      this.server.to(roomId).emit('new-message', payload);

      // Also push to receiver's personal room in case they haven't joined the conv room
      this.server.to(`user:${data.receiverId}`).emit('new-message', payload);
    } catch {
      client.emit('error', { message: 'Failed to send message' });
    }
  }
}
