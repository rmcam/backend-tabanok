import { CategoryDifficulty, CategoryStatus, CategoryType } from '../types/category.enum';

export interface CategoryProgress {
    totalExercises: number;
    completedExercises: number;
    averageScore: number;
    timeSpentMinutes: number;
    lastPracticed: string | null;
    masteryLevel: number;
    streak: number;
}

export interface Category {
    type: CategoryType;
    difficulty: CategoryDifficulty;
    status: CategoryStatus;
    progress: CategoryProgress;
    prerequisites: CategoryType[];
    unlockRequirements: {
        requiredScore: number;
        requiredCategories: CategoryType[];
    };
    subCategories?: string[];
}

export interface LearningMetrics {
    totalLessonsCompleted: number;
    totalExercisesCompleted: number;
    averageScore: number;
    totalTimeSpentMinutes: number;
    longestStreak: number;
    currentStreak: number;
    lastActivityDate: string | null;
    totalMasteryScore: number;
}

export interface AchievementStats {
    totalAchievements: number;
    achievementsByCategory: Record<string, number>;
    lastAchievementDate: string;
    specialAchievements: string[];
}

export interface BadgeStats {
    totalBadges: number;
    badgesByTier: Record<string, number>;
    lastBadgeDate: string;
    activeBadges: string[];
}

export interface CategoryMetrics extends Record<CategoryType, Category> { } 