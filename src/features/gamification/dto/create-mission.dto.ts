import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MissionFrequency, MissionType } from '../entities/mission.entity';

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
    @IsInt()
    targetValue: number;

    @ApiProperty({ description: 'Puntos de recompensa' })
    @IsInt()
    rewardPoints: number;

    @ApiProperty({ description: 'Fecha de inicio', required: false })
    @IsOptional()
    @IsDate()
    startDate?: Date;

    @ApiProperty({ description: 'Fecha de finalización', required: false })
    @IsOptional()
    @IsDate()
    endDate?: Date;

    @ApiProperty({ description: 'Insignia de recompensa', required: false })
    @IsOptional()
    rewardBadge?: {
        id: string;
        name: string;
        icon: string;
    };
} 