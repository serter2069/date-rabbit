import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Job } from 'bull';
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

@Processor('notifications-push')
export class PushWorker {
  private readonly logger = new Logger(PushWorker.name);

  constructor(
    @InjectRepository(NotificationDeliveryLog)
    private readonly deliveryLogRepo: Repository<NotificationDeliveryLog>,
  ) {}

  @Process()
  async handle(job: { data: PushNotificationJob }): Promise<void> {
    const { notificationId, title, body, pushToken, data, deduplicationKey } = job.data;

    if (!pushToken) {
      await this.log(notificationId, 'skipped', deduplicationKey, 'No push token');
      return;
    }

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: pushToken, title, body, data }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Expo API ${response.status}: ${text}`);
      }

      await this.log(notificationId, 'sent', deduplicationKey);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      this.logger.error(`Push worker failed for notification ${notificationId}: ${error}`);
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
