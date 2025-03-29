import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../../auth/entities/user.entity';

@Entity('user_levels')
export class UserLevel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ default: 1 })
    currentLevel: number;

    @Column({ default: 0 })
    experiencePoints: number;

    @Column('jsonb', { default: { current: 0, longest: 0, lastActivityDate: new Date() } })
    consistencyStreak: {
        current: number;
        longest: number;
        lastActivityDate: Date;
    };

    @Column('jsonb', { default: [] })
    streakHistory: Array<{
        startDate: Date;
        endDate: Date;
        duration: number;
    }>;

    @Column('jsonb', { nullable: true })
    achievements?: Array<{
        achievementId: string;
        unlockedAt: Date;
    }>;

    @Column('jsonb', { nullable: true })
    milestones?: Array<{
        level: number;
        reward: string;
        isAchieved: boolean;
    }>;

    @Column()
    experienceToNextLevel: number;

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

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 