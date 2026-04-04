import { Injectable, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { UsersService } from '../users/users.service';

const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, any>;
  }): Promise<Notification> {
    const notification = this.notificationsRepository.create(data);
    const saved = await this.notificationsRepository.save(notification);

    // Fire push delivery after DB save — failure must never break the caller
    this.sendExpoPush(data.userId, data.title, data.body, data.data).catch(
      (err) => this.logger.error(`Push delivery failed for user ${data.userId}: ${err}`),
    );

    return saved;
  }

  async getByUser(userId: string, limit = 20, offset = 0): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { id, userId },
      { isRead: true },
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
  }

  // ─── Expo Push ──────────────────────────────────────────────────────────────

  private async sendExpoPush(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) return;

    // Respect user-level notification toggle
    if (!user.notificationsEnabled) return;

    const token = user.expoPushToken;
    // Expo push tokens always start with 'ExponentPushToken['
    if (!token || !token.startsWith('ExponentPushToken[')) return;

    const payload = {
      to: token,
      title,
      body,
      sound: 'default',
      data: data ?? {},
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    try {
      const res = await fetch(EXPO_PUSH_API, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const text = await res.text();
        this.logger.warn(`Expo push non-OK (${res.status}) for user ${userId}: ${text}`);
      } else {
        this.logger.log(`Expo push sent to user ${userId}`);
      }
    } catch (err: any) {
      clearTimeout(timeout);
      if (err?.name === 'AbortError') {
        this.logger.warn(`Expo push timeout for user ${userId}`);
      } else {
        throw err;
      }
    }
  }
}
