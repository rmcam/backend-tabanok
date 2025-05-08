import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../auth/entities/user.entity'; // Ruta corregida
import { Achievement } from './achievement.entity';
import { Badge } from './badge.entity';
import { Mission } from './mission.entity';

interface CulturalAchievement {
  title: string;
  description: string;
  culturalValue: string;
  achievedAt: Date;
  seasonType: string;
}

interface RecentActivity {
  type: string;
  description: string;
  pointsEarned: number;
  timestamp: Date;
}

@Entity('gamification')
export class Gamification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'integer', default: 0 })
  points: number;

  @ManyToMany(() => Achievement)
  @JoinTable()
  achievements: Achievement[];

  @ManyToMany(() => Badge)
  @JoinTable()
  badges: Badge[];

  @ManyToMany(() => Mission)
  @JoinTable()
  activeMissions: Mission[];

  @Column('json', {
    default: {
      lessonsCompleted: 0,
      exercisesCompleted: 0,
      perfectScores: 0,
      culturalContributions: 0,
    },
  })
  stats: {
    lessonsCompleted: number;
    exercisesCompleted: number;
    perfectScores: number;
    culturalContributions: number;
  };

  @Column('jsonb', { nullable: true })
  milestones?: Array<{
    level: number;
    reward: string;
    isAchieved: boolean;
  }>;

  @Column('jsonb', { default: [] })
  levelHistory: Array<{
    level: number;
    achievedAt: Date;
    bonusesReceived: Array<{
      type: string;
      value: number;
    }>;
  }>;

  @Column('jsonb', { default: [] })
  activityLog: Array<{
    date: Date;
    activityType: string;
    experienceGained: number;
    metadata?: Record<string, any>;
  }>;

  @Column('jsonb', { default: [] })
  bonuses: Array<{
    type: string;
    multiplier: number;
    expiresAt?: Date;
    conditions?: Record<string, any>;
  }>;

  @Column('json', { default: [] })
  recentActivities: RecentActivity[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ type: 'integer', default: 1 })
  level: number;

  @Column({ type: 'float', default: 0 })
  experience: number;

  @Column({ type: 'float', default: 100 })
  nextLevelExperience: number;

  @Column('json', { default: [] })
  culturalAchievements: CulturalAchievement[];

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
