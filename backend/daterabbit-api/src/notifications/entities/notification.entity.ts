import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  BOOKING_NEW = 'booking_new',
  BOOKING_CONFIRMED = 'booking_confirmed',
  BOOKING_DECLINED = 'booking_declined',
  BOOKING_CANCELLED = 'booking_cancelled',
  BOOKING_COMPLETED = 'booking_completed',
  NEW_MESSAGE = 'new_message',
  NO_SHOW = 'no_show',
  SOS_ALERT = 'sos_alert',
  SAFETY_ALERT = 'safety_alert',
  REPORT_ISSUE = 'report_issue',
  COMPANION_ONLINE = 'companion_online',
  PAYOUT_PROCESSED = 'payout_processed',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
