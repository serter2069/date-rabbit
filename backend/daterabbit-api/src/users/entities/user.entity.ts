import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum UserRole {
  SEEKER = 'seeker',
  COMPANION = 'companion',
}

export enum UserVerificationStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.SEEKER })
  role: UserRole;

  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'jsonb', default: [] })
  photos: { id: string; url: string; order: number; isPrimary: boolean }[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate: number;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 5.0 })
  rating: number;

  @Column({ default: 0 })
  reviewCount: number;

  @Column({ default: false })
  isVerified: boolean;

  @Column({
    type: 'enum',
    enum: UserVerificationStatus,
    default: UserVerificationStatus.NOT_STARTED,
  })
  verificationStatus: UserVerificationStatus;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  stripeAccountId: string;

  @Column({ default: false })
  stripeOnboardingComplete: boolean;

  @Column({ nullable: true })
  otpCode: string;

  @Column({ nullable: true })
  otpExpiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
