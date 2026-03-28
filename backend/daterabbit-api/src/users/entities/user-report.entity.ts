import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_reports')
export class UserReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  reporterId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reporterId' })
  reporter: User;

  @Column()
  reportedId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reportedId' })
  reported: User;

  @Column()
  reason: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'pending' })
  status: string; // pending, reviewed, dismissed

  @CreateDateColumn()
  createdAt: Date;
}
