import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('platform_settings')
export class PlatformSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 15.0 })
  commissionRate: number; // platform fee %

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 10.0 })
  minHourlyRate: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 500.0 })
  maxHourlyRate: number;

  @Column({ default: true })
  requireVerification: boolean;

  @Column({ default: true })
  requirePhotoForCompanion: boolean;

  @Column({ type: 'int', default: 18 })
  minimumAge: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
