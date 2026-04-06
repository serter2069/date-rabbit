import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailService } from '../../email/email.service';
import { NotificationDeliveryLog } from '../entities/notification-delivery-log.entity';

export interface EmailNotificationJob {
  notificationId: string;
  userId: string;
  title: string;
  body: string;
  recipientEmail?: string;
  deduplicationKey?: string;
}

@Injectable()
export class EmailChannel {
  private readonly logger = new Logger(EmailChannel.name);

  constructor(
    private readonly emailService: EmailService,
    @InjectRepository(NotificationDeliveryLog)
    private readonly deliveryLogRepo: Repository<NotificationDeliveryLog>,
  ) {}

  async handle(data: EmailNotificationJob): Promise<void> {
    const { notificationId, title, body, recipientEmail, deduplicationKey } = data;

    if (!recipientEmail) {
      await this.log(notificationId, 'skipped', deduplicationKey, 'No recipient email');
      return;
    }

    try {
      await this.emailService.sendEmail({
        to: recipientEmail,
        subject: title,
        htmlContent: `<p>${body}</p>`,
      });
      await this.log(notificationId, 'sent', deduplicationKey);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      this.logger.error(`Email channel failed for notification ${notificationId}: ${error}`);
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
          channel: 'email',
          status,
          error: error ?? null,
          deduplicationKey: deduplicationKey ?? null,
        }),
      );
    } catch (logErr) {
      this.logger.error(`Failed to write email delivery log: ${logErr}`);
    }
  }
}
