import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum VerificationType {
  SEEKER = 'seeker',
  COMPANION = 'companion',
}

export enum VerificationStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('verifications')
export class Verification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: VerificationType })
  type: VerificationType;

  @Column({
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.IN_PROGRESS,
  })
  status: VerificationStatus;

  @Column({ nullable: true })
  ssnLast4: string;

  @Column({ nullable: true })
  idPhotoUrl: string;

  @Column({ nullable: true })
  selfieUrl: string;

  @Column({ nullable: true })
  videoUrl: string;

  @Column({ default: false })
  consentGiven: boolean;

  @Column({ type: 'timestamp', nullable: true })
  consentDate: Date;

  @Column({ nullable: true })
  checkrCandidateId: string;

  @Column({ nullable: true })
  checkrReportId: string;

  @Column({ nullable: true })
  rejectionReason: string;

  @Column({ type: 'jsonb', nullable: true })
  references: { name: string; phone: string; relationship: string }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
