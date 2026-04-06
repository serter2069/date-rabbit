import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { Notification, NotificationType } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { NotificationDeliveryLog } from './entities/notification-delivery-log.entity';
import type { EmailNotificationJob } from './channels/email.channel';
import type { PushNotificationJob } from './channels/push.channel';
import type { InAppNotificationJob } from './channels/inapp.channel';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,

    @InjectRepository(NotificationPreference)
    private preferencesRepository: Repository<NotificationPreference>,

    @InjectRepository(NotificationDeliveryLog)
    private deliveryLogRepository: Repository<NotificationDeliveryLog>,

    @Optional() @InjectQueue('notifications')
    private notificationsQueue: Queue | null,
  ) {}

  /**
   * Fire-and-forget Expo push. Silently skips if token is missing.
   * Never throws — push failures must not affect DB notification saving.
   */
  async sendPush(
    token: string | null | undefined,
    title: string,
    body: string,
    data?: Record<string, unknown>,
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
    data?: Record<string, unknown>;
    /** Optional: Expo push token of the recipient. If provided and notificationsEnabled, push is sent. */
    pushToken?: string | null;
    /** Optional: notificationPreferences JSON from user entity. Used to check per-category opt-in. */
    notificationPreferences?: Record<string, boolean> | null;
    /** Optional: whether user has globally enabled notifications. Defaults to true if not provided. */
    notificationsEnabled?: boolean;
    /** Optional: recipient email for email channel fan-out. */
    recipientEmail?: string;
    /** Optional: deduplication key — if already in delivery_log → skip fan-out. */
    deduplicationKey?: string;
  }): Promise<Notification> {
    const {
      pushToken,
      notificationPreferences,
      notificationsEnabled,
      recipientEmail,
      deduplicationKey,
      ...notifData
    } = data;

    const notification = this.notificationsRepository.create(notifData);
    const saved = await this.notificationsRepository.save(notification);

    // Determine per-category key for legacy preference check (backward compat)
    const prefKey = this.prefKeyForType(data.type);
    const globalEnabled = notificationsEnabled !== false; // true if undefined
    const legacyCategoryEnabled =
      !notificationPreferences ||
      notificationPreferences[prefKey] !== false;

    if (globalEnabled) {
      // Fan-out via BullMQ queue (graceful degradation if Valkey unavailable)
      this.fanOut({
        notification: saved,
        pushToken,
        recipientEmail,
        deduplicationKey,
        legacyCategoryEnabled,
      }).catch((err) => this.logger.error(`Fan-out error for ${saved.id}: ${err}`));
    }

    return saved;
  }

  private async fanOut(opts: {
    notification: Notification;
    pushToken?: string | null;
    recipientEmail?: string;
    deduplicationKey?: string;
    legacyCategoryEnabled: boolean;
  }): Promise<void> {
    const { notification, pushToken, recipientEmail, deduplicationKey, legacyCategoryEnabled } =
      opts;

    // Deduplication check
    if (deduplicationKey) {
      const existing = await this.deliveryLogRepository.findOne({
        where: { deduplicationKey },
      });
      if (existing) {
        this.logger.debug(
          `Skipping fan-out for notification ${notification.id} — duplicate key ${deduplicationKey}`,
        );
        return;
      }
    }

    // Load per-type preferences from DB (new system)
    const eventType = notification.type as string;
    const dbPref = await this.preferencesRepository.findOne({
      where: { userId: notification.userId, eventType },
    });

    // Default: all channels enabled (respect DB pref if exists, else legacy pref)
    const emailEnabled = dbPref ? dbPref.emailEnabled : legacyCategoryEnabled;
    const pushEnabled = dbPref ? dbPref.pushEnabled : legacyCategoryEnabled;
    const inappEnabled = dbPref ? dbPref.inappEnabled : legacyCategoryEnabled;

    const queueReady = this.notificationsQueue && isQueueClientReady(this.notificationsQueue);

    // Email channel
    if (emailEnabled) {
      if (queueReady) {
        try {
          const job: EmailNotificationJob = {
            notificationId: notification.id,
            userId: notification.userId,
            title: notification.title,
            body: notification.body,
            recipientEmail,
            deduplicationKey,
          };
          await this.notificationsQueue!.add('email', job, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
          });
        } catch (err) {
          this.logger.warn(`Email queue error for ${notification.id}: ${err}`);
        }
      }
      // No direct-send fallback for email (requires template context)
    }

    // Push channel
    if (pushEnabled) {
      if (queueReady) {
        try {
          const job: PushNotificationJob = {
            notificationId: notification.id,
            userId: notification.userId,
            title: notification.title,
            body: notification.body,
            pushToken,
            data: notification.data,
            deduplicationKey,
          };
          await this.notificationsQueue!.add('push', job, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
          });
        } catch (err) {
          this.logger.warn(
            `Push queue error, falling back to direct push for ${notification.id}: ${err}`,
          );
          this.sendPush(pushToken, notification.title, notification.body, notification.data).catch(
            () => undefined,
          );
        }
      } else if (pushToken) {
        // Graceful degradation: no queue → fire-and-forget directly
        this.sendPush(pushToken, notification.title, notification.body, notification.data).catch(
          () => undefined,
        );
      }
    }

    // InApp channel
    if (inappEnabled) {
      if (queueReady) {
        try {
          const job: InAppNotificationJob = {
            notificationId: notification.id,
            userId: notification.userId,
            title: notification.title,
            body: notification.body,
            type: notification.type,
            data: notification.data,
            createdAt: notification.createdAt?.toISOString(),
            deduplicationKey,
          };
          await this.notificationsQueue!.add('inapp', job, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
          });
        } catch (err) {
          this.logger.warn(`InApp queue error for ${notification.id}: ${err}`);
        }
      }
    }
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

  // ─── Preferences API ─────────────────────────────────────────────────────────

  async getPreferences(userId: string): Promise<NotificationPreference[]> {
    return this.preferencesRepository.find({ where: { userId } });
  }

  async updatePreference(
    userId: string,
    eventType: string,
    update: { emailEnabled?: boolean; pushEnabled?: boolean; inappEnabled?: boolean },
  ): Promise<NotificationPreference> {
    let pref = await this.preferencesRepository.findOne({ where: { userId, eventType } });
    if (!pref) {
      pref = this.preferencesRepository.create({ userId, eventType });
    }
    if (update.emailEnabled !== undefined) pref.emailEnabled = update.emailEnabled;
    if (update.pushEnabled !== undefined) pref.pushEnabled = update.pushEnabled;
    if (update.inappEnabled !== undefined) pref.inappEnabled = update.inappEnabled;
    return this.preferencesRepository.save(pref);
  }

  async resetPreferences(userId: string): Promise<void> {
    await this.preferencesRepository.delete({ userId });
  }
}

/**
 * Cheaply checks if a BullMQ queue's ioredis client is in ready state.
 * Prevents unhandled rejections when Valkey is temporarily unavailable.
 */
function isQueueClientReady(queue: Queue): boolean {
  try {
    // BullMQ exposes the underlying ioredis client via opts.connection
    const connection = (queue as unknown as { opts?: { connection?: { status?: string } } }).opts
      ?.connection;
    if (!connection) return true; // assume ready if we can't inspect
    return connection.status === 'ready';
  } catch {
    return false;
  }
}
