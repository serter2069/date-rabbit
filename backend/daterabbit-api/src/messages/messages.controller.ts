import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private messagesService: MessagesService,
    private usersService: UsersService,
  ) {}

  @Get('conversations')
  async getConversations(@Request() req) {
    const [conversations, blockedIds] = await Promise.all([
      this.messagesService.getConversations(req.user.id),
      this.usersService.getBlockedUserIds(req.user.id),
    ]);

    const blockedSet = new Set(blockedIds);

    return conversations
      .filter((c) => {
        const otherId = c.user1Id === req.user.id ? c.user2Id : c.user1Id;
        return !blockedSet.has(otherId);
      })
      .map((c) => ({
        id: c.id,
        otherUser: c.user1Id === req.user.id ? {
          id: c.user2.id,
          name: c.user2.name,
          photos: c.user2.photos,
        } : {
          id: c.user1.id,
          name: c.user1.name,
          photos: c.user1.photos,
        },
        lastMessageAt: c.lastMessageAt,
        lastMessage: c.lastMessage?.content || null,
      }));
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.messagesService.getUnreadCount(req.user.id);
    return { count };
  }

  // Explicit route declared before @Get(':userId') wildcard to prevent route collision
  @Get('unread')
  async getUnreadMessages(@Request() req) {
    const count = await this.messagesService.getUnreadCount(req.user.id);
    return { unread: count };
  }

  @Get(':userId')
  async getMessages(
    @Param('userId') otherUserId: string,
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const messages = await this.messagesService.getMessages(
      req.user.id,
      otherUserId,
      Math.min(limit ? parseInt(limit) || 50 : 50, 100),
      offset ? parseInt(offset) || 0 : 0,
    );

    // Mark as read
    await this.messagesService.markAsRead(req.user.id, otherUserId);

    return messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      content: m.content,
      isRead: m.isRead,
      createdAt: m.createdAt,
      isOwn: m.senderId === req.user.id,
    }));
  }

  @Post(':userId')
  async sendMessage(
    @Param('userId') receiverId: string,
    @Request() req,
    @Body() body: { content: string },
  ) {
    if (!body.content?.trim()) {
      throw new HttpException('Message content is required', HttpStatus.BAD_REQUEST);
    }
    if (body.content.length > 5000) {
      throw new HttpException('Message too long (max 5000 chars)', HttpStatus.BAD_REQUEST);
    }

    // Prevent messaging blocked users (in either direction)
    const [blockedByMe, blockedByThem] = await Promise.all([
      this.usersService.isBlocked(req.user.id, receiverId),
      this.usersService.isBlocked(receiverId, req.user.id),
    ]);
    if (blockedByMe || blockedByThem) {
      throw new HttpException('Cannot send message to this user', HttpStatus.FORBIDDEN);
    }

    const message = await this.messagesService.sendMessage(
      req.user.id,
      receiverId,
      body.content.trim(),
    );

    return {
      id: message.id,
      senderId: message.senderId,
      content: message.content,
      isRead: message.isRead,
      createdAt: message.createdAt,
      isOwn: true,
    };
  }
}
