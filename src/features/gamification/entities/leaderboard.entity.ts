import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum LeaderboardType {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    ALL_TIME = 'ALL_TIME'
}

export enum LeaderboardCategory {
    POINTS = 'POINTS',
    LESSONS_COMPLETED = 'LESSONS_COMPLETED',
    EXERCISES_COMPLETED = 'EXERCISES_COMPLETED',
    PERFECT_SCORES = 'PERFECT_SCORES',
    LEARNING_STREAK = 'LEARNING_STREAK',
    CULTURAL_CONTRIBUTIONS = 'CULTURAL_CONTRIBUTIONS'
}

export interface LeaderboardRanking {
    userId: string;
    name: string;
    score: number;
    rank: number;
    change: number;
    achievements: string[];
}

@Entity('leaderboards')
export class Leaderboard {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: LeaderboardType
    })
    type: LeaderboardType;

    @Column({
        type: 'enum',
        enum: LeaderboardCategory
    })
    category: LeaderboardCategory;

    @Column('json')
    rankings: LeaderboardRanking[];

    @Column('timestamp')
    startDate: Date;

    @Column('timestamp')
    endDate: Date;

    @Column('timestamp')
    lastUpdated: Date;

    @Column('jsonb', { nullable: true })
    rewards: Array<{
        rank: number;
        points: number;
        badge?: {
            id: string;
            name: string;
            icon: string;
        };
    }>;
} 