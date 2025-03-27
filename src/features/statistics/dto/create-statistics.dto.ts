import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { CategoryType } from '../interfaces/category.interface';

export class CreateStatisticsDto {
    @ApiProperty({ description: 'ID del usuario' })
    @IsUUID()
    userId: string;

    categoryMetrics?: Record<CategoryType, {
        type: CategoryType;
        difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
        status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'MASTERED';
        progress: {
            totalExercises: number;
            completedExercises: number;
            averageScore: number;
            timeSpentMinutes: number;
            lastPracticed: string | null;
            masteryLevel: number;
            streak: number;
        };
        prerequisites: CategoryType[];
        unlockRequirements: {
            requiredScore: number;
            requiredCategories: CategoryType[];
        };
        subCategories?: string[];
    }>;

    strengthAreas?: Array<{
        category: CategoryType;
        score: number;
        lastUpdated: Date;
        trend: 'improving' | 'declining' | 'stable';
        recommendations: string[];
    }>;

    improvementAreas?: Array<{
        category: CategoryType;
        score: number;
        lastUpdated: Date;
        trend: 'improving' | 'declining' | 'stable';
        recommendations: string[];
    }>;

    learningMetrics?: {
        totalLessonsCompleted: number;
        totalExercisesCompleted: number;
        averageScore: number;
        totalTimeSpentMinutes: number;
        longestStreak: number;
        currentStreak: number;
        lastActivityDate: Date | null;
        totalMasteryScore: number;
    };

    weeklyProgress?: Array<{
        weekStartDate: Date;
        lessonsCompleted: number;
        exercisesCompleted: number;
        averageScore: number;
        timeSpentMinutes: number;
    }>;

    monthlyProgress?: Array<{
        monthStartDate: Date;
        lessonsCompleted: number;
        exercisesCompleted: number;
        averageScore: number;
        timeSpentMinutes: number;
    }>;

    achievementStats?: {
        totalAchievements: number;
        achievementsByCategory: Record<CategoryType, number>;
        lastAchievementDate: Date;
        specialAchievements: string[];
    };

    badgeStats?: {
        totalBadges: number;
        badgesByTier: Record<string, number>;
        lastBadgeDate: Date;
        activeBadges: string[];
    };

    learningPath?: {
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
            category: CategoryType;
            target: number;
            deadline: Date;
            progress: number;
        }>;
    };
} 