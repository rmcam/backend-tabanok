import { IsArray, IsNotEmpty, IsNumber, IsObject, IsOptional, IsUUID } from 'class-validator';
import { Achievement } from '../entities/achievement.entity';
import { Badge } from '../entities/badge.entity';

export class CreateGamificationDto {
    @IsNotEmpty()
    @IsUUID()
    userId: string;

    @IsOptional()
    @IsNumber()
    points?: number;

    @IsOptional()
    @IsNumber()
    level?: number;

    @IsOptional()
    @IsNumber()
    experience?: number;

    @IsOptional()
    @IsNumber()
    nextLevelExperience?: number;

    @IsOptional()
    @IsArray()
    achievements?: Achievement[];

    @IsOptional()
    @IsArray()
    badges?: Badge[];

    @IsOptional()
    @IsObject()
    stats?: {
        lessonsCompleted: number;
        exercisesCompleted: number;
        perfectScores: number;
        learningStreak: number;
        lastActivityDate: Date;
    };

    @IsOptional()
    @IsArray()
    recentActivities?: {
        type: string;
        description: string;
        pointsEarned: number;
        timestamp: Date;
    }[];
} 