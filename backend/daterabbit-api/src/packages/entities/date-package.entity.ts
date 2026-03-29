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
import { DatePackageTemplate } from './date-package-template.entity';

@Entity('date_packages')
export class DatePackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companionId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'companionId' })
  companion: User;

  @Column()
  templateId: string;

  @ManyToOne(() => DatePackageTemplate)
  @JoinColumn({ name: 'templateId' })
  template: DatePackageTemplate;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'text', nullable: true })
  customDescription: string | null;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
