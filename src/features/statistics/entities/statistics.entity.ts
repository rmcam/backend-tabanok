import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Area } from '../interfaces/area.interface';
import { Category } from '../interfaces/category.interface';
import { MonthlyProgress, PeriodicProgress, WeeklyProgress } from '../interfaces/periodic-progress.interface';
import { CategoryDifficulty, CategoryStatus, CategoryType, FrequencyType, GoalType } from '../types/category.enum';

@Entity('statistics')
export class Statistics {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty()
    @Column()
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
    @Column('jsonb', { default: {} })
    categoryMetrics: Record<CategoryType, Category>;

    @ApiProperty({
        type: 'array',
        items: {
            $ref: '#/components/schemas/Area'
        }
    })
    @Column('jsonb', { default: '[]' })
    strengthAreas: Area[];

    @ApiProperty({
        type: 'array',
        items: {
            $ref: '#/components/schemas/Area'
        }
    })
    @Column('jsonb', { default: '[]' })
    improvementAreas: Area[];

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
    @Column('jsonb')
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
    @Column({ type: 'jsonb', default: [] })
    weeklyProgress: WeeklyProgress[];

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
    @Column({ type: 'jsonb', default: [] })
    monthlyProgress: MonthlyProgress[];

    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                category: { enum: Object.values(CategoryType) },
                lessonsCompleted: { type: 'number' },
                exercisesCompleted: { type: 'number' },
                averageScore: { type: 'number' },
                timeSpentMinutes: { type: 'number' }
            }
        }
    })
    @Column({ type: 'jsonb', default: [] })
    periodicProgress: PeriodicProgress[];

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
    @Column('jsonb')
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
    @Column('jsonb')
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
    @Column('jsonb')
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
            type: GoalType;
            target: number;
            frequency: FrequencyType;
            deadline: string;
            description: string;
            isCompleted: boolean;
        }>;
    };

    @ApiProperty({ type: 'string', format: 'date-time' })
    @CreateDateColumn()
    createdAt: string;

    @ApiProperty({ type: 'string', format: 'date-time' })
    @UpdateDateColumn()
    updatedAt: string;
} 