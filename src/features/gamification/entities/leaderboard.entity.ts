import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../../auth/entities/user.entity';
import { LeaderboardType, LeaderboardCategory } from '../enums/leaderboard.enum';

interface Ranking {
  userId: string;
  name: string;
  score: number;
  achievements: string[];
  rank: number;
  change: number;
}

interface Reward {
  rank: number;
  points: number;
  badge?: {
    id: string;
    name: string;
    icon: string;
  };
}

@Entity('leaderboards')
export class Leaderboard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: LeaderboardType,
    default: LeaderboardType.DAILY
  })
  type: LeaderboardType;

  @Column({
    type: 'enum',
    enum: LeaderboardCategory,
    default: LeaderboardCategory.POINTS
  })
  category: LeaderboardCategory;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'jsonb' })
  rankings: Ranking[];

  @Column({ type: 'jsonb' })
  rewards: Reward[];

  @ManyToOne(() => User, (user) => user.leaderboards)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastUpdated: Date;
}
