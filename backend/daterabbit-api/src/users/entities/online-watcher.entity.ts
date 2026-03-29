import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('online_watchers')
@Index(['watcherId', 'companionId'], { unique: true })
export class OnlineWatcher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  watcherId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'watcherId' })
  watcher: User;

  @Column()
  companionId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'companionId' })
  companion: User;

  @CreateDateColumn()
  createdAt: Date;
}
