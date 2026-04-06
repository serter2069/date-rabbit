import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Job } from 'bull';
import { NotificationDeliveryLog } from '../entities/notification-delivery-log.entity';
import { NotificationsGateway } from '../notifications.gateway';

export interface InAppNotificationJob {
  notificationId: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  data?: Record<string, unknown>;
  createdAt?: string;
  deduplicationKey?: string;
}

@Processor('notifications-inapp')
export class InAppWorker {
  private readonly logger = new Logger(InAppWorker.name);

  constructor(
    private readonly notificationsGateway: NotificationsGateway,
    @InjectRepository(NotificationDeliveryLog)
    private readonly deliveryLogRepo: Repository<NotificationDeliveryLog>,
  ) {}

  @Process()
  async handle(job: { data: InAppNotificationJob }): Promise<void> {
    const { notificationId, userId, title, body, type, data, createdAt, deduplicationKey } =
      job.data;

    try {
      this.notificationsGateway.sendToUser(userId, {
        id: notificationId,
        type,
        title,
        body,
        data,
        isRead: false,
        createdAt: createdAt ?? new Date().toISOString(),
      });
      await this.log(notificationId, 'sent', deduplicationKey);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      this.logger.error(`InApp worker failed for notification ${notificationId}: ${error}`);
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
          channel: 'inapp',
          status,
          error: error ?? null,
          deduplicationKey: deduplicationKey ?? null,
        }),
      );
    } catch (logErr) {
      this.logger.error(`Failed to write inapp delivery log: ${logErr}`);
    }
  }
}
