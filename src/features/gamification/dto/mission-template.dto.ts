import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MissionFrequency } from '../entities/mission-template.entity'; // Use MissionFrequency
import { MissionType } from '../entities/mission.entity'; // Import MissionType from correct location

class MissionObjectiveDto {
    @ApiProperty({ description: 'Descripción del objetivo de la misión' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ description: 'Tipo de objetivo (ej. "complete_lesson", "practice_word")' })
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty({ description: 'Valor objetivo (ej. ID de lección, número de palabras)' })
    @IsNotEmpty()
    targetValue: any; // Puede ser string, number, etc. dependiendo del tipo
}

export class CreateMissionTemplateDto {
    @ApiProperty({ description: 'Nombre de la plantilla de misión' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Descripción de la plantilla de misión' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ enum: MissionType, description: 'Tipo de misión' })
    @IsEnum(MissionType)
    type: MissionType;

    @ApiProperty({ enum: MissionFrequency, description: 'Frecuencia de la misión' }) // Use MissionFrequency
    @IsEnum(MissionFrequency)
    frequency: MissionFrequency; // Rename property

    @ApiProperty({ description: 'Puntos otorgados al completar la misión', minimum: 0 })
    @IsInt()
    @Min(0)
    pointsReward: number;

    @ApiProperty({ type: [MissionObjectiveDto], description: 'Objetivos de la misión' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MissionObjectiveDto)
    objectives: MissionObjectiveDto[];

    @ApiProperty({ description: 'Condiciones para que la misión esté disponible (opcional)', required: false })
    @IsOptional()
    conditions?: any; // Podría ser un objeto JSON con condiciones específicas
}

export class UpdateMissionTemplateDto {
    @ApiProperty({ description: 'Nombre de la plantilla de misión', required: false })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @ApiProperty({ description: 'Descripción de la plantilla de misión', required: false })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    description?: string;

    @ApiProperty({ enum: MissionType, description: 'Tipo de misión', required: false })
    @IsOptional()
    @IsEnum(MissionType)
    type?: MissionType;

    @ApiProperty({ enum: MissionFrequency, description: 'Frecuencia de la misión', required: false }) // Use MissionFrequency
    @IsOptional()
    @IsEnum(MissionFrequency)
    frequency?: MissionFrequency; // Rename property

    @ApiProperty({ description: 'Puntos otorgados al completar la misión', minimum: 0, required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    pointsReward?: number;

    @ApiProperty({ type: [MissionObjectiveDto], description: 'Objetivos de la misión', required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MissionObjectiveDto)
    objectives?: MissionObjectiveDto[];

    @ApiProperty({ description: 'Condiciones para que la misión esté disponible (opcional)', required: false })
    @IsOptional()
    conditions?: any;
}
