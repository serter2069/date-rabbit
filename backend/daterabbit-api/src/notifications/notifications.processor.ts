import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { EmailChannel, type EmailNotificationJob } from './channels/email.channel';
import { PushChannel, type PushNotificationJob } from './channels/push.channel';
import { InAppChannel, type InAppNotificationJob } from './channels/inapp.channel';

export type NotificationJobName = 'email' | 'push' | 'inapp';

export type NotificationJobPayload =
  | ({ name: 'email' } & EmailNotificationJob)
  | ({ name: 'push' } & PushNotificationJob)
  | ({ name: 'inapp' } & InAppNotificationJob);

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    private readonly emailChannel: EmailChannel,
    private readonly pushChannel: PushChannel,
    private readonly inAppChannel: InAppChannel,
  ) {
    super();
  }

  async process(job: Job<NotificationJobPayload>): Promise<void> {
    this.logger.debug(`Processing notification job ${job.id} (name: ${job.name})`);

    switch (job.name as NotificationJobName) {
      case 'email':
        await this.emailChannel.handle(job.data as EmailNotificationJob);
        break;
      case 'push':
        await this.pushChannel.handle(job.data as PushNotificationJob);
        break;
      case 'inapp':
        await this.inAppChannel.handle(job.data as InAppNotificationJob);
        break;
      default:
        this.logger.warn(`Unknown notification job name: ${job.name}`);
    }
  }
}
