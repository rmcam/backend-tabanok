import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { MissionEntityFrequency as MissionFrequency, MissionType } from '../entities';
import { Season } from '../entities/season.entity';

export enum MissionStatus {
    ACTIVE = 'active',
    COMPLETED = 'completed',
    EXPIRED = 'expired',
    FAILED = 'failed'
}

export class MissionDto {
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

export class CreateMissionDto extends MissionDto { }

export class MissionFilterDto {
    @ApiProperty({
        description: 'Tipo de misión a filtrar',
        enum: MissionType,
        required: false
    })
    @IsOptional()
    @IsEnum(MissionType)
    type?: MissionType;

    @ApiProperty({
        description: 'Estado de la misión a filtrar',
        enum: MissionStatus,
        required: false
    })
    @IsOptional()
    @IsEnum(MissionStatus)
    status?: MissionStatus;
}

export class UpdateMissionProgressDto {
    @ApiProperty({
        description: 'Progreso actual hacia el objetivo de la misión',
        example: 3
    })
    @IsNotEmpty()
    @IsNumber()
    currentProgress: number;

    @ApiProperty({
        description: 'Estado actual de la misión',
        enum: MissionStatus,
        example: MissionStatus.ACTIVE
    })
    @IsNotEmpty()
    @IsEnum(MissionStatus)
    status: MissionStatus;
}
