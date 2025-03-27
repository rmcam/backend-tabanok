import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('statistics')
export class Statistics {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'jsonb', default: {} })
    learningMetrics: {
        totalLessonsCompleted: number;
        totalExercisesCompleted: number;
        averageScore: number;
        totalTimeSpentMinutes: number;
        longestStreak: number;
        currentStreak: number;
    };

    @Column({ type: 'jsonb', default: {} })
    progressByCategory: {
        vocabulary: number;
        grammar: number;
        pronunciation: number;
        comprehension: number;
        writing: number;
    };

    @Column({ type: 'jsonb', default: [] })
    weeklyProgress: {
        weekStartDate: Date;
        lessonsCompleted: number;
        exercisesCompleted: number;
        averageScore: number;
        timeSpentMinutes: number;
    }[];

    @Column({ type: 'jsonb', default: [] })
    monthlyProgress: {
        monthStartDate: Date;
        lessonsCompleted: number;
        exercisesCompleted: number;
        averageScore: number;
        timeSpentMinutes: number;
    }[];

    @Column({ type: 'jsonb', default: {} })
    achievementStats: {
        totalAchievements: number;
        achievementsByCategory: Record<string, number>;
        lastAchievementDate: Date;
    };

    @Column({ type: 'jsonb', default: {} })
    badgeStats: {
        totalBadges: number;
        badgesByTier: Record<string, number>;
        lastBadgeDate: Date;
    };

    @Column({ type: 'jsonb', default: [] })
    strengthAreas: {
        category: string;
        score: number;
        lastUpdated: Date;
    }[];

    @Column({ type: 'jsonb', default: [] })
    improvementAreas: {
        category: string;
        score: number;
        lastUpdated: Date;
    }[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
} 