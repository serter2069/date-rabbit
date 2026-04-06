import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationDeliveryLog } from '../entities/notification-delivery-log.entity';

export interface PushNotificationJob {
  notificationId: string;
  userId: string;
  title: string;
  body: string;
  pushToken?: string | null;
  data?: Record<string, unknown>;
  deduplicationKey?: string;
}

@Injectable()
export class PushChannel {
  private readonly logger = new Logger(PushChannel.name);

  constructor(
    @InjectRepository(NotificationDeliveryLog)
    private readonly deliveryLogRepo: Repository<NotificationDeliveryLog>,
  ) {}

  async handle(data: PushNotificationJob): Promise<void> {
    const { notificationId, title, body, pushToken, data: payload, deduplicationKey } = data;

    if (!pushToken) {
      await this.log(notificationId, 'skipped', deduplicationKey, 'No push token');
      return;
    }

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: pushToken, title, body, data: payload }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Expo API ${response.status}: ${text}`);
      }

      await this.log(notificationId, 'sent', deduplicationKey);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      this.logger.error(`Push channel failed for notification ${notificationId}: ${error}`);
      await this.log(notificationId, 'failed', deduplicationKey, error);
      throw err; // BullMQ retry
    }
  }

  private async log(
    notificationId: string,
    status: 'sent' | 'failed' | 'skipped',
    deduplicationKey?: string,
    error?: string,
  ): Promise<void> {
    try {
      await this.deliveryLogRepo.save(
        this.deliveryLogRepo.create({
          notificationId,
          channel: 'push',
          status,
          error: error ?? null,
          deduplicationKey: deduplicationKey ?? null,
        }),
      );
    } catch (logErr) {
      this.logger.error(`Failed to write push delivery log: ${logErr}`);
    }
  }
}
