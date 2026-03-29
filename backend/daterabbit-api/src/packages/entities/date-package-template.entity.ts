import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ActivityType } from '../../bookings/entities/booking.entity';

@Entity('date_package_templates')
export class DatePackageTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column()
  nameRu: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  descriptionRu: string;

  @Column({ type: 'int' })
  defaultDuration: number; // hours

  @Column({ type: 'enum', enum: ActivityType })
  defaultActivity: ActivityType;

  @Column({ default: '' })
  icon: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  order: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
