import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export enum ExerciseType {
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
    FILL_IN_BLANK = 'FILL_IN_BLANK',
    TRANSLATION = 'TRANSLATION',
    PRONUNCIATION = 'PRONUNCIATION',
    LISTENING = 'LISTENING'
}

export class CreateExerciseDto {
    @ApiProperty({ description: 'Título del ejercicio' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'Descripción del ejercicio' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ description: 'Tipo de ejercicio', enum: ExerciseType })
    @IsEnum(ExerciseType)
    type: ExerciseType;

    @ApiProperty({ description: 'Contenido del ejercicio en formato JSON' })
    @IsNotEmpty()
    content: Record<string, any>;

    @ApiProperty({ description: 'ID del tema al que pertenece el ejercicio' })
    @IsUUID()
    topicId: string;

    @ApiProperty({ description: 'Etiquetas del ejercicio', required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @ApiProperty({ description: 'Nivel de dificultad (1-5)', required: false })
    @IsOptional()
    difficultyLevel?: number;
} 