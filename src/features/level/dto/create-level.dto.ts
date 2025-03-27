import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { LevelType } from '../entities/level.entity';

export class CreateLevelDto {
    @ApiProperty({ description: 'Nombre del nivel' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Descripción del nivel' })
    @IsString()
    description: string;

    @ApiProperty({ description: 'Tipo de nivel', enum: LevelType })
    @IsEnum(LevelType)
    type: LevelType;

    @ApiProperty({ description: 'Orden del nivel', required: false })
    @IsNumber()
    @IsOptional()
    order?: number;

    @ApiProperty({ description: 'Si el nivel está bloqueado', required: false })
    @IsBoolean()
    @IsOptional()
    isLocked?: boolean;

    @ApiProperty({ description: 'Puntos requeridos para desbloquear', required: false })
    @IsNumber()
    @IsOptional()
    requiredPoints?: number;
} 