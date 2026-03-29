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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
