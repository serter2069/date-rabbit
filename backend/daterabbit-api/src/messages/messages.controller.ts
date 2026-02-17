import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get('conversations')
  async getConversations(@Request() req) {
    const conversations = await this.messagesService.getConversations(req.user.id);
    return conversations.map((c) => ({
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
    }));
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.messagesService.getUnreadCount(req.user.id);
    return { count };
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
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
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
