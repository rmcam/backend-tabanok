import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../../auth/entities/user.entity'; // Ruta corregida
import { Achievement } from './achievement.entity';

export enum AchievementStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('user_achievements')
export class UserAchievement {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn('uuid')
  achievementId: string;

  @Column({
    type: 'enum',
    enum: ['GENERAL', 'CULTURAL'],
    default: 'GENERAL',
  })
  achievementType: 'GENERAL' | 'CULTURAL';

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Achievement, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'achievementId' })
  achievement: Achievement;

  @Column({
    type: 'enum',
    enum: AchievementStatus,
    default: AchievementStatus.IN_PROGRESS,
  })
  status: AchievementStatus;

  @Column('json', { nullable: true })
  progress?: {
    current: number;
    total: number;
    steps?: string[];
  };

  @Column({ nullable: true })
  completedAt?: Date;

  @Column({ type: 'timestamp' })
  dateAwarded: Date;

  @CreateDateColumn()
  createdAt: Date;
}
