import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { MissionFrequency, MissionType } from '../entities/mission.entity';
import { Season } from '../entities/season.entity';

export class CreateMissionDto {
    @ApiProperty({ description: 'Título de la misión' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'Descripción de la misión' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ description: 'Tipo de misión', enum: MissionType })
    @IsEnum(MissionType)
    type: MissionType;

    @ApiProperty({ description: 'Frecuencia de la misión', enum: MissionFrequency })
    @IsEnum(MissionFrequency)
    frequency: MissionFrequency;

    @ApiProperty({ description: 'Valor objetivo para completar la misión' })
    @IsNumber()
    targetValue: number;

    @ApiProperty({ description: 'Puntos de recompensa' })
    @IsNumber()
    rewardPoints: number;

    @ApiProperty({ description: 'Fecha de inicio' })
    @IsDate()
    startDate: Date;

    @ApiProperty({ description: 'Fecha de finalización' })
    @IsDate()
    endDate: Date;

    @ApiProperty({ description: 'Temporada asociada', required: false })
    @IsOptional()
    season?: Season;

    @ApiProperty({ description: 'Valor objetivo base para misiones dinámicas', required: false })
    @IsOptional()
    @IsNumber()
    baseTargetValue?: number;

    @ApiProperty({ description: 'Puntos de recompensa base para misiones dinámicas', required: false })
    @IsOptional()
    @IsNumber()
    baseRewardPoints?: number;

    @ApiProperty({ description: 'Nivel mínimo requerido', required: false })
    @IsOptional()
    @IsNumber()
    minLevel?: number;

    @ApiProperty({ description: 'Condiciones de bonificación', required: false })
    @IsOptional()
    @IsArray()
    bonusConditions?: {
        condition: string;
        multiplier: number;
    }[];

    @ApiProperty({ description: 'Insignia de recompensa', required: false })
    @IsOptional()
    rewardBadge?: {
        id: string;
        name: string;
        icon: string;
    };

    @ApiProperty({ description: 'Completado por usuarios', required: false })
    @IsOptional()
    @IsArray()
    completedBy?: {
        userId: string;
        progress: number;
        completedAt?: Date;
    }[];
} 