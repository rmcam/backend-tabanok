import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export enum AchievementType {
    LEVEL_REACHED = 'LEVEL_REACHED',
    LESSONS_COMPLETED = 'LESSONS_COMPLETED',
    PERFECT_SCORES = 'PERFECT_SCORES',
    STREAK_MAINTAINED = 'STREAK_MAINTAINED',
    CULTURAL_CONTRIBUTIONS = 'CULTURAL_CONTRIBUTIONS',
    POINTS_EARNED = 'POINTS_EARNED',
    FIRST_DAILY_LOGIN = 'FIRST_DAILY_LOGIN'
}

export class AchievementDto {
    @ApiProperty({ description: 'Nombre del logro' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Descripción del logro' })
    @IsString()
    description: string;

    @ApiProperty({ description: 'Tipo de logro', enum: AchievementType })
    @IsEnum(AchievementType)
    type: AchievementType;

    @ApiProperty({ description: 'Requisito para desbloquear el logro' })
    @IsNumber()
    requirement: number;

    @ApiProperty({ description: 'Puntos de bonificación al desbloquear el logro' })
    @IsNumber()
    bonusPoints: number;

    @ApiProperty({ description: 'Insignia asociada al logro', required: false })
    @IsOptional()
    badge?: {
        id: string;
        name: string;
        icon: string;
    };
}
