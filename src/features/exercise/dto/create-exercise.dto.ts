import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { ExerciseType } from '../entities/exercise.entity';

export class CreateExerciseDto {
    @ApiProperty({ description: 'Título del ejercicio' })
    @IsString()
    title: string;

    @ApiProperty({ description: 'Descripción del ejercicio' })
    @IsString()
    description: string;

    @ApiProperty({ description: 'Tipo de ejercicio', enum: ExerciseType })
    @IsEnum(ExerciseType)
    type: ExerciseType;

    @ApiProperty({ description: 'Contenido del ejercicio' })
    @IsObject()
    content: Record<string, any>;

    @ApiProperty({ description: 'Respuesta correcta' })
    @IsObject()
    correctAnswer: Record<string, any>;

    @ApiProperty({ description: 'Puntos otorgados', required: false })
    @IsNumber()
    @IsOptional()
    points?: number;

    @ApiProperty({ description: 'Orden del ejercicio', required: false })
    @IsNumber()
    @IsOptional()
    order?: number;

    @ApiProperty({ description: 'Si el ejercicio está activo', required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ description: 'Límite de tiempo en segundos', required: false })
    @IsNumber()
    @IsOptional()
    timeLimit?: number;

    @ApiProperty({ description: 'Número de intentos permitidos', required: false })
    @IsNumber()
    @IsOptional()
    attempts?: number;

    @ApiProperty({ description: 'Pistas disponibles', required: false })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    hints?: string[];

    @ApiProperty({ description: 'Retroalimentación', required: false })
    @IsString()
    @IsOptional()
    feedback?: string;

    @ApiProperty({ description: 'Metadatos adicionales', required: false })
    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;

    @ApiProperty({ description: 'ID de la lección a la que pertenece' })
    @IsNumber()
    lessonId: number;
} 