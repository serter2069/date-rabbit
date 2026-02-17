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

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
