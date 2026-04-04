import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PAID = 'paid',
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  PENDING_COMPLETION = 'pending_completion',
}

export enum ActivityType {
  DINNER = 'dinner',
  COFFEE = 'coffee',
  DRINKS = 'drinks',
  EVENTS = 'events',
  MUSEUMS = 'museums',
  WALK = 'walk',
  OTHER = 'other',
}

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  seekerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seekerId' })
  seeker: User;

  @Column()
  companionId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'companionId' })
  companion: User;

  @Column({ type: 'timestamp' })
  dateTime: Date;

  @Column()
  duration: number; // hours

  @Column({ type: 'enum', enum: ActivityType })
  activity: ActivityType;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ nullable: true })
  paymentIntentId: string;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ type: 'timestamp', nullable: true })
  seekerCheckinAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  companionCheckinAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  activeDateStartedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  activeDateEndedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actualDurationHours: number;

  @Column({ type: 'timestamp', nullable: true })
  sosTriggeredAt: Date;

  @Column({ nullable: true })
  sosTriggeredBy: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  sosLat: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  sosLon: number;

  @Column({ type: 'text', nullable: true })
  noShowReason: string;

  @Column({ type: 'jsonb', nullable: true })
  datePlan: Record<string, any>;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  extendRequestedHours: number;

  @Column({ type: 'timestamp', nullable: true })
  extendRequestedAt: Date;

  @Column({ type: 'boolean', nullable: true })
  extendApproved: boolean;

  @Column({ type: 'timestamp', nullable: true })
  safetyCheckinAt: Date;

  @Column({ type: 'text', nullable: true })
  reportIssueText: string;

  @Column({ nullable: true })
  reportIssueType: string;

  @Column({ nullable: true })
  packageId: string;

  @Column({ type: 'boolean', default: false })
  selfieVerified: boolean;

  // Who initiated the cancellation (seekerId or companionId) — used for tiered refund policy
  @Column({ nullable: true })
  cancelledByUserId: string;

  // Refund percentage applied at cancellation time (0, 50, or 100)
  @Column({ type: 'int', nullable: true })
  refundPercent: number;

  // UC-048: Post-date completion confirmation flow
  // Set by companion when they mark the date as completed; moves booking to PENDING_COMPLETION
  @Column({ type: 'timestamp', nullable: true })
  completionRequestedAt: Date;

  // Actual hours reported by companion at completion time
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  completionActualHours: number;

  // Set when seeker confirms (or auto-set after 24h timeout)
  @Column({ type: 'timestamp', nullable: true })
  completionConfirmedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
