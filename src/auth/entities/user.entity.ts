import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from '../../features/account/entities/account.entity'; // Ruta corregida
import { UserAchievement } from '../../features/gamification/entities/user-achievement.entity'; // Ruta corregida
import { UserReward } from '../../features/gamification/entities/user-reward.entity'; // Ruta corregida
import { Progress } from '../../features/progress/entities/progress.entity'; // Ruta corregida
import { Leaderboard } from '../../features/gamification/entities/leaderboard.entity';

export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  ELDER = 'elder',
  TEACHER = 'teacher',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column('text', { array: true })
  languages: string[];

  @Column('json')
  preferences: {
    notifications: boolean;
    language: string;
    theme: string;
  };

  @Column({ default: 0 })
  points: number;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  culturalPoints: number;

  @Column('json', {
    default: {
      totalPoints: 0,
      level: 1,
      lessonsCompleted: 0,
      exercisesCompleted: 0,
      perfectScores: 0,
    },
  })
  gameStats: {
    totalPoints: number;
    level: number;
    lessonsCompleted: number;
    exercisesCompleted: number;
    perfectScores: number;
  };

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetPasswordExpires?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ default: false })
  isEmailVerified: boolean;

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];

  @OneToMany(() => UserReward, (userReward) => userReward.user)
  userRewards: UserReward[];

  @OneToMany(() => UserAchievement, (userAchievement) => userAchievement.user)
  userAchievements: UserAchievement[];

  @OneToMany(() => Progress, (progress) => progress.user)
  progress: Progress[];

  @OneToMany(() => Leaderboard, (leaderboard) => leaderboard.user)
  leaderboards: Leaderboard[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
