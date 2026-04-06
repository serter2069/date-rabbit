import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type DeliveryChannel = 'email' | 'push' | 'inapp';
export type DeliveryStatus = 'sent' | 'failed' | 'skipped';

@Entity('notification_delivery_logs')
@Index(['notificationId', 'channel'])
@Index(['deduplicationKey'], { unique: false })
export class NotificationDeliveryLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  notificationId: string;

  @Column({ type: 'varchar', length: 10 })
  channel: DeliveryChannel;

  @Column({ type: 'varchar', length: 10 })
  status: DeliveryStatus;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'varchar', nullable: true })
  deduplicationKey: string | null;

  @CreateDateColumn()
  sentAt: Date;
}
