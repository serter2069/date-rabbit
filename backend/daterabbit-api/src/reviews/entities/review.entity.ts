import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reviewerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewerId' })
  reviewer: User;

  @Column()
  revieweeId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'revieweeId' })
  reviewee: User;

  @Column()
  bookingId: string;

  @ManyToOne(() => Booking)
  @JoinColumn({ name: 'bookingId' })
  booking: Booking;

  @Column({ type: 'int' })
  rating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
