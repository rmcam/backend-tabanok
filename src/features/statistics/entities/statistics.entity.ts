import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { MonthlyProgress, WeeklyProgress } from '../interfaces/periodic-progress.interface';

interface LearningMetrics {
    totalLessonsCompleted: number;
    totalExercisesCompleted: number;
    averageScore: number;
    totalTimeSpentMinutes: number;
    longestStreak: number;
    currentStreak: number;
}

type CategoryType = 'vocabulary' | 'grammar' | 'pronunciation' | 'comprehension' | 'writing';

interface ProgressByCategory extends Record<CategoryType, number> { }

interface AchievementStats {
    totalAchievements: number;
    achievementsByCategory: Record<string, number>;
    lastAchievementDate: Date;
}

interface BadgeStats {
    totalBadges: number;
    badgesByTier: Record<string, number>;
    lastBadgeDate: Date;
}

interface Area {
    category: string;
    score: number;
    lastUpdated: Date;
}

@Entity('statistics')
export class Statistics {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'jsonb', default: {} })
    learningMetrics: LearningMetrics;

    @Column({ type: 'jsonb', default: {} })
    progressByCategory: ProgressByCategory;

    @Column({ type: 'jsonb', default: [] })
    weeklyProgress: WeeklyProgress[];

    @Column({ type: 'jsonb', default: [] })
    monthlyProgress: MonthlyProgress[];

    @Column({ type: 'jsonb', default: {} })
    achievementStats: AchievementStats;

    @Column({ type: 'jsonb', default: {} })
    badgeStats: BadgeStats;

    @Column({ type: 'jsonb', default: [] })
    strengthAreas: Area[];

    @Column({ type: 'jsonb', default: [] })
    improvementAreas: Area[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
} 