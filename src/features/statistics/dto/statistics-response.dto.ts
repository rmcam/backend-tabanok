import { ApiProperty } from '@nestjs/swagger';
import { StoredArea } from '../interfaces/stored-area.interface';
import { CategoryType } from '../types/category.enum';

export class StatisticsResponseDTO {
    @ApiProperty()
    id: string;

    @ApiProperty()
    userId: string;

    @ApiProperty({
        type: 'object',
        additionalProperties: {
            type: 'object',
            properties: {
                type: { enum: Object.values(CategoryType) },
                difficulty: { type: 'string' },
                status: { type: 'string' },
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
                },
                prerequisites: { type: 'array', items: { enum: Object.values(CategoryType) } },
                unlockRequirements: {
                    type: 'object',
                    properties: {
                        requiredScore: { type: 'number' },
                        requiredCategories: { type: 'array', items: { enum: Object.values(CategoryType) } }
                    }
                },
                subCategories: { type: 'array', items: { type: 'string' }, nullable: true }
            }
        }
    })
    categoryMetrics: Record<CategoryType, {
        type: CategoryType;
        difficulty: string;
        status: string;
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
            type: 'object',
            properties: {
                category: { enum: Object.values(CategoryType) },
                score: { type: 'number' },
                lastUpdated: { type: 'string', format: 'date-time' },
                trend: { enum: ['improving', 'declining', 'stable'] },
                recommendations: { type: 'array', items: { type: 'string' } }
            }
        }
    })
    strengthAreas: StoredArea[];

    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                category: { enum: Object.values(CategoryType) },
                score: { type: 'number' },
                lastUpdated: { type: 'string', format: 'date-time' },
                trend: { enum: ['improving', 'declining', 'stable'] },
                recommendations: { type: 'array', items: { type: 'string' } }
            }
        }
    })
    improvementAreas: StoredArea[];

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
    learningMetrics: {
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
    weeklyProgress: Array<{
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
    monthlyProgress: Array<{
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
    achievementStats: {
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
    badgeStats: {
        totalBadges: number;
        badgesByTier: Record<string, number>;
        lastBadgeDate: string;
        activeBadges: string[];
    };

    @ApiProperty({
        type: 'object',
        properties: {
            currentLevel: { type: 'number' },
            recommendedCategories: { type: 'array', items: { type: 'string' } },
            nextMilestones: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        category: { type: 'string' },
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
                        type: { enum: ['score', 'exercises', 'time', 'streak'] },
                        target: { type: 'number' },
                        frequency: { enum: ['daily', 'weekly', 'monthly'] },
                        deadline: { type: 'string', format: 'date-time' },
                        description: { type: 'string' },
                        isCompleted: { type: 'boolean' }
                    }
                }
            }
        }
    })
    learningPath: {
        currentLevel: number;
        recommendedCategories: string[];
        nextMilestones: Array<{
            category: string;
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

    @ApiProperty({ type: 'string', format: 'date-time' })
    createdAt: string;

    @ApiProperty({ type: 'string', format: 'date-time' })
    updatedAt: string;
} 