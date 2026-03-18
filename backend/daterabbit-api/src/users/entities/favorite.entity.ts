import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn, Unique } from 'typeorm';
import { User } from './user.entity';

@Entity('favorites')
@Unique(['userId', 'companionId'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  companionId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'companionId' })
  companion: User;

  @CreateDateColumn()
  createdAt: Date;
}
