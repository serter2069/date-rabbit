import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, Conversation } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
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
      content,
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
      relations: ['user1', 'user2'],
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
}
