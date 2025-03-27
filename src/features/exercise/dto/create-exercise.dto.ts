import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ExerciseType } from '../entities/exercise.entity';

export class CreateExerciseDto {
    @ApiProperty({
        description: 'El título del ejercicio',
        example: 'Conjugación de verbos',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'La descripción del ejercicio',
        example: 'Practica la conjugación de verbos en presente',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        description: 'El tipo de ejercicio',
        enum: ExerciseType,
        example: ExerciseType.MULTIPLE_CHOICE,
    })
    @IsEnum(ExerciseType)
    type: ExerciseType;

    @ApiProperty({
        description: 'El orden del ejercicio en la lección',
        example: 1,
        minimum: 1,
    })
    @IsNumber()
    @Min(1)
    order: number;

    @ApiProperty({
        description: 'El contenido del ejercicio',
        example: {
            question: '¿Cuál es la conjugación correcta?',
            options: ['como', 'comes', 'come', 'comen'],
            correctAnswer: 1,
        },
    })
    @IsNotEmpty()
    content: Record<string, any>;

    @ApiProperty({
        description: 'La solución del ejercicio',
        example: {
            explanation: 'La conjugación correcta es "comes" porque...',
        },
        required: false,
    })
    @IsOptional()
    solution?: Record<string, any>;

    @ApiProperty({
        description: 'Los puntos que otorga el ejercicio',
        example: 10,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    points: number;

    @ApiProperty({
        description: 'ID de la lección a la que pertenece el ejercicio',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    lessonId: string;
} 