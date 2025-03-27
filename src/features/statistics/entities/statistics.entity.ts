import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Area, Category, CategoryType } from '../interfaces/category.interface';
import { MonthlyProgress, WeeklyProgress } from '../interfaces/periodic-progress.interface';

interface LearningMetrics {
    totalLessonsCompleted: number;
    totalExercisesCompleted: number;
    averageScore: number;
    totalTimeSpentMinutes: number;
    longestStreak: number;
    currentStreak: number;
    lastActivityDate: Date | null;
    totalMasteryScore: number; // Promedio ponderado de todas las categorías
}

interface CategoryMetrics extends Record<CategoryType, Category> { }

interface AchievementStats {
    totalAchievements: number;
    achievementsByCategory: Record<CategoryType, number>;
    lastAchievementDate: Date;
    specialAchievements: string[]; // IDs de logros especiales desbloqueados
}

interface BadgeStats {
    totalBadges: number;
    badgesByTier: Record<string, number>;
    lastBadgeDate: Date;
    activeBadges: string[]; // IDs de insignias actualmente activas
}

@Entity('statistics')
export class Statistics {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'jsonb', default: {} })
    categoryMetrics: Record<CategoryType, Category>;

    @Column({ type: 'jsonb', default: [] })
    strengthAreas: Area[];

    @Column({ type: 'jsonb', default: [] })
    improvementAreas: Area[];

    @Column({ type: 'jsonb', default: {} })
    learningMetrics: LearningMetrics;

    @Column({ type: 'jsonb', default: [] })
    weeklyProgress: WeeklyProgress[];

    @Column({ type: 'jsonb', default: [] })
    monthlyProgress: MonthlyProgress[];

    @Column({ type: 'jsonb', default: {} })
    achievementStats: AchievementStats;

    @Column({ type: 'jsonb', default: {} })
    badgeStats: BadgeStats;

    @Column({ type: 'jsonb', default: {} })
    learningPath: {
        currentLevel: number;
        recommendedCategories: CategoryType[];
        nextMilestones: Array<{
            category: CategoryType;
            name: string;
            requiredProgress: number;
            currentProgress: number;
        }>;
        customGoals: Array<{
            id: string;
            type: 'score' | 'exercises' | 'time' | 'streak';
            target: number;
            frequency: 'daily' | 'weekly' | 'monthly';
            deadline: string;
            description: string;
            isCompleted: boolean;
        }>;
    };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 