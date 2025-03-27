import { IsArray, IsNotEmpty, IsObject, IsOptional, IsUUID } from 'class-validator';

export class CreateStatisticsDto {
    @IsNotEmpty()
    @IsUUID()
    userId: string;

    @IsOptional()
    @IsObject()
    learningMetrics?: {
        totalLessonsCompleted: number;
        totalExercisesCompleted: number;
        averageScore: number;
        totalTimeSpentMinutes: number;
        longestStreak: number;
        currentStreak: number;
    };

    @IsOptional()
    @IsObject()
    progressByCategory?: {
        vocabulary: number;
        grammar: number;
        pronunciation: number;
        comprehension: number;
        writing: number;
    };

    @IsOptional()
    @IsArray()
    weeklyProgress?: {
        weekStartDate: Date;
        lessonsCompleted: number;
        exercisesCompleted: number;
        averageScore: number;
        timeSpentMinutes: number;
    }[];

    @IsOptional()
    @IsArray()
    monthlyProgress?: {
        monthStartDate: Date;
        lessonsCompleted: number;
        exercisesCompleted: number;
        averageScore: number;
        timeSpentMinutes: number;
    }[];

    @IsOptional()
    @IsObject()
    achievementStats?: {
        totalAchievements: number;
        achievementsByCategory: Record<string, number>;
        lastAchievementDate: Date;
    };

    @IsOptional()
    @IsObject()
    badgeStats?: {
        totalBadges: number;
        badgesByTier: Record<string, number>;
        lastBadgeDate: Date;
    };

    @IsOptional()
    @IsArray()
    strengthAreas?: {
        category: string;
        score: number;
        lastUpdated: Date;
    }[];

    @IsOptional()
    @IsArray()
    improvementAreas?: {
        category: string;
        score: number;
        lastUpdated: Date;
    }[];
} 