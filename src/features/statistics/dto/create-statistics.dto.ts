import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import { Area } from '../interfaces/area.interface';
import { CategoryDifficulty, CategoryStatus, CategoryType, FrequencyType, GoalType } from '../types/category.enum';

export class CreateStatisticsDto {
    @ApiProperty()
    @IsUUID()
    userId: string;

    @ApiProperty({
        type: 'object',
        additionalProperties: {
            type: 'object',
            properties: {
                type: { enum: Object.values(CategoryType) },
                difficulty: { enum: Object.values(CategoryDifficulty) },
                status: { enum: Object.values(CategoryStatus) },
                progress: {
                    type: 'object',
                    properties: {
                        totalExercises: { type: 'number' },
                        completedExercises: { type: 'number' },
                        averageScore: { type: 'number' },
                        timeSpentMinutes: { type: 'number' },
                        lastPracticed: { type: 'string', format: 'date-time', nullable: true },
                        masteryLevel: { type: 'number' },
                        streak: { type: 'number' }
                    }
                }
            }
        }
    })
    categoryMetrics?: Record<CategoryType, {
        type: CategoryType;
        difficulty: CategoryDifficulty;
        status: CategoryStatus;
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

    @ApiProperty({
        type: 'array',
        items: {
            $ref: '#/components/schemas/Area'
        }
    })
    strengthAreas?: Area[];

    @ApiProperty({
        type: 'array',
        items: {
            $ref: '#/components/schemas/Area'
        }
    })
    improvementAreas?: Area[];

    @ApiProperty({
        type: 'object',
        properties: {
            totalLessonsCompleted: { type: 'number' },
            totalExercisesCompleted: { type: 'number' },
            averageScore: { type: 'number' },
            totalTimeSpentMinutes: { type: 'number' },
            longestStreak: { type: 'number' },
            currentStreak: { type: 'number' },
            lastActivityDate: { type: 'string', format: 'date-time', nullable: true },
            totalMasteryScore: { type: 'number' }
        }
    })
    learningMetrics?: {
        totalLessonsCompleted: number;
        totalExercisesCompleted: number;
        averageScore: number;
        totalTimeSpentMinutes: number;
        longestStreak: number;
        currentStreak: number;
        lastActivityDate: string | null;
        totalMasteryScore: number;
    };

    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                week: { type: 'string' },
                lessonsCompleted: { type: 'number' },
                exercisesCompleted: { type: 'number' },
                averageScore: { type: 'number' },
                timeSpentMinutes: { type: 'number' }
            }
        }
    })
    weeklyProgress?: Array<{
        week: string;
        lessonsCompleted: number;
        exercisesCompleted: number;
        averageScore: number;
        timeSpentMinutes: number;
    }>;

    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                month: { type: 'string' },
                lessonsCompleted: { type: 'number' },
                exercisesCompleted: { type: 'number' },
                averageScore: { type: 'number' },
                timeSpentMinutes: { type: 'number' }
            }
        }
    })
    monthlyProgress?: Array<{
        month: string;
        lessonsCompleted: number;
        exercisesCompleted: number;
        averageScore: number;
        timeSpentMinutes: number;
    }>;

    @ApiProperty({
        type: 'object',
        properties: {
            totalAchievements: { type: 'number' },
            achievementsByCategory: {
                type: 'object',
                additionalProperties: { type: 'number' }
            },
            lastAchievementDate: { type: 'string', format: 'date-time' },
            specialAchievements: { type: 'array', items: { type: 'string' } }
        }
    })
    achievementStats?: {
        totalAchievements: number;
        achievementsByCategory: Record<string, number>;
        lastAchievementDate: string;
        specialAchievements: string[];
    };

    @ApiProperty({
        type: 'object',
        properties: {
            totalBadges: { type: 'number' },
            badgesByTier: {
                type: 'object',
                additionalProperties: { type: 'number' }
            },
            lastBadgeDate: { type: 'string', format: 'date-time' },
            activeBadges: { type: 'array', items: { type: 'string' } }
        }
    })
    badgeStats?: {
        totalBadges: number;
        badgesByTier: Record<string, number>;
        lastBadgeDate: string;
        activeBadges: string[];
    };

    @ApiProperty({
        type: 'object',
        properties: {
            currentLevel: { type: 'number' },
            recommendedCategories: { type: 'array', items: { enum: Object.values(CategoryType) } },
            nextMilestones: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        category: { enum: Object.values(CategoryType) },
                        name: { type: 'string' },
                        requiredProgress: { type: 'number' },
                        currentProgress: { type: 'number' }
                    }
                }
            },
            customGoals: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        type: { enum: Object.values(GoalType) },
                        target: { type: 'number' },
                        frequency: { enum: Object.values(FrequencyType) },
                        deadline: { type: 'string', format: 'date-time' },
                        description: { type: 'string' },
                        isCompleted: { type: 'boolean' }
                    }
                }
            }
        }
    })
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
            type: GoalType;
            target: number;
            frequency: FrequencyType;
            deadline: string;
            description: string;
            isCompleted: boolean;
        }>;
    };
} 