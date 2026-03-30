import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ReferralBonusType {
  BGC_DISCOUNT_50 = 'bgc_discount_50',
}

export enum ReferralStatus {
  PENDING = 'pending',
  CREDITED = 'credited',
}

@Entity('referrals')
export class Referral {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  referrerId: string;

  @Column({ type: 'uuid' })
  refereeId: string;

  @Column({ type: 'enum', enum: ReferralBonusType, default: ReferralBonusType.BGC_DISCOUNT_50 })
  bonusType: ReferralBonusType;

  @Column({ type: 'enum', enum: ReferralStatus, default: ReferralStatus.PENDING })
  status: ReferralStatus;

  @Column({ type: 'timestamp', nullable: true })
  creditedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
