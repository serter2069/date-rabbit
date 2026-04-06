import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, Conversation } from './entities/message.entity';
import { BookingsService } from '../bookings/bookings.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { sanitizeText } from '../common/sanitize';

// Max messages a seeker can send to a companion before booking
const PRE_CHAT_LIMIT = 3;

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
    private bookingsService: BookingsService,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  async getOrCreateConversation(user1Id: string, user2Id: string): Promise<Conversation> {
    // Always store users in consistent order
    const [id1, id2] = [user1Id, user2Id].sort();

    let conversation = await this.conversationsRepository.findOne({
      where: [
        { user1Id: id1, user2Id: id2 },
      ],
    });

    if (!conversation) {
      conversation = this.conversationsRepository.create({
        user1Id: id1,
        user2Id: id2,
      });
      conversation = await this.conversationsRepository.save(conversation);
    }

    return conversation;
  }

  async sendMessage(senderId: string, receiverId: string, content: string): Promise<Message> {
    const conversation = await this.getOrCreateConversation(senderId, receiverId);

    const message = this.messagesRepository.create({
      senderId,
      receiverId,
      content: sanitizeText(content),
    });

    const saved = await this.messagesRepository.save(message);

    // Update conversation
    await this.conversationsRepository.update(conversation.id, {
      lastMessageId: saved.id,
      lastMessageAt: saved.createdAt,
    });

    // Event 4: Create notification for receiver with Expo push (non-blocking)
    try {
      const receiver = await this.usersService.findById(receiverId);
      await this.notificationsService.create({
        userId: receiverId,
        type: NotificationType.NEW_MESSAGE,
        title: 'New Message',
        body: content.length > 100 ? content.slice(0, 100) + '...' : content,
        data: { senderId, conversationId: conversation.id },
        pushToken: receiver?.expoPushToken,
        notificationPreferences: receiver?.notificationPreferences,
        notificationsEnabled: receiver?.notificationsEnabled,
      });
    } catch {
      // Notification failure must NOT break message delivery
    }

    return saved;
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    return this.conversationsRepository.find({
      where: [
        { user1Id: userId },
        { user2Id: userId },
      ],
      relations: ['user1', 'user2', 'lastMessage'],
      order: { lastMessageAt: 'DESC' },
    });
  }

  async getMessages(userId: string, otherUserId: string, limit = 50, offset = 0): Promise<Message[]> {
    return this.messagesRepository.find({
      where: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async markAsRead(userId: string, senderId: string): Promise<void> {
    await this.messagesRepository.update(
      { receiverId: userId, senderId, isRead: false },
      { isRead: true },
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messagesRepository.count({
      where: { receiverId: userId, isRead: false },
    });
  }

  /**
   * UC-037: Check if seeker can send pre-chat message to companion.
   * Returns status indicating whether the seeker can send messages
   * before creating a booking. Limit is lifted when companion replies.
   */
  async getPreChatStatus(
    seekerId: string,
    companionId: string,
  ): Promise<{
    hasBooking: boolean;
    companionReplied: boolean;
    messageCount: number;
    canSend: boolean;
    messagesLeft: number;
  }> {
    // Check if any booking exists between these users
    const hasBooking = await this.bookingsService.hasAnyBooking(seekerId, companionId);
    if (hasBooking) {
      return { hasBooking: true, companionReplied: false, messageCount: 0, canSend: true, messagesLeft: PRE_CHAT_LIMIT };
    }

    // Check if companion has replied (companion sent message to seeker)
    const companionReplyCount = await this.messagesRepository.count({
      where: { senderId: companionId, receiverId: seekerId },
    });
    const companionReplied = companionReplyCount > 0;

    if (companionReplied) {
      // Companion replied — no limit applies
      return { hasBooking: false, companionReplied: true, messageCount: 0, canSend: true, messagesLeft: PRE_CHAT_LIMIT };
    }

    // Count messages sent by seeker to companion
    const messageCount = await this.messagesRepository.count({
      where: { senderId: seekerId, receiverId: companionId },
    });

    return {
      hasBooking: false,
      companionReplied: false,
      messageCount,
      canSend: messageCount < PRE_CHAT_LIMIT,
      messagesLeft: Math.max(0, PRE_CHAT_LIMIT - messageCount),
    };
  }
}
