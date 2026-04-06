import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  /**
   * Fire-and-forget Expo push. Silently skips if token is missing.
   * Never throws — push failures must not affect DB notification saving.
   */
  async sendPush(
    token: string | null | undefined,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    if (!token) return;
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: token, title, body, data }),
      });
    } catch {
      // push failure is non-critical
    }
  }

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, any>;
    /** Optional: Expo push token of the recipient. If provided and notificationsEnabled, push is sent. */
    pushToken?: string | null;
    /** Optional: notificationPreferences JSON from user entity. Used to check per-category opt-in. */
    notificationPreferences?: Record<string, boolean> | null;
    /** Optional: whether user has globally enabled notifications. Defaults to true if not provided. */
    notificationsEnabled?: boolean;
  }): Promise<Notification> {
    const { pushToken, notificationPreferences, notificationsEnabled, ...notifData } = data;
    const notification = this.notificationsRepository.create(notifData);
    const saved = await this.notificationsRepository.save(notification);

    // Determine per-category key for preference check
    const prefKey = this.prefKeyForType(data.type);
    const globalEnabled = notificationsEnabled !== false; // true if undefined
    const categoryEnabled =
      !notificationPreferences || // no prefs object means all enabled
      notificationPreferences[prefKey] !== false;

    if (pushToken && globalEnabled && categoryEnabled) {
      // Fire-and-forget — don't await so DB save isn't delayed
      this.sendPush(pushToken, data.title, data.body, data.data).catch(() => undefined);
    }

    return saved;
  }

  private prefKeyForType(type: NotificationType): string {
    switch (type) {
      case NotificationType.NEW_MESSAGE:
        return 'messages';
      case NotificationType.PAYOUT_PROCESSED:
        return 'payments';
      default:
        return 'bookings';
    }
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
}
