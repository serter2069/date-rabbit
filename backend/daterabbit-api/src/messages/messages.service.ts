import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, Conversation } from './entities/message.entity';
import { BookingsService } from '../bookings/bookings.service';
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
   * Returns { allowed, sent, limit } indicating whether the seeker
   * can still send messages before creating a booking.
   */
  async getPreChatStatus(
    senderId: string,
    receiverId: string,
  ): Promise<{ allowed: boolean; sent: number; limit: number }> {
    // Check if any booking exists between these users
    const hasBooking = await this.bookingsService.hasAnyBooking(senderId, receiverId);
    if (hasBooking) {
      // No limit if a booking already exists
      return { allowed: true, sent: 0, limit: PRE_CHAT_LIMIT };
    }

    // Count messages sent by this sender to this receiver
    const sent = await this.messagesRepository.count({
      where: { senderId, receiverId },
    });

    return {
      allowed: sent < PRE_CHAT_LIMIT,
      sent,
      limit: PRE_CHAT_LIMIT,
    };
  }
}
