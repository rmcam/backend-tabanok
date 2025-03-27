import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ExerciseType } from '../entities/exercise.entity';

export class CreateExerciseDto {
    @ApiProperty({
        description: 'Título del ejercicio',
        example: 'Conjugación de verbos',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'Descripción del ejercicio',
        example: 'Practica la conjugación de verbos regulares en presente',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        description: 'Tipo de ejercicio',
        enum: ExerciseType,
        example: ExerciseType.MULTIPLE_CHOICE,
    })
    @IsEnum(ExerciseType)
    type: ExerciseType;

    @ApiProperty({
        description: 'Contenido del ejercicio en formato JSON',
        example: {
            question: '¿Cuál es la conjugación correcta de "to be" en presente?',
            options: ['am', 'is', 'are'],
            correctAnswer: 1,
        },
    })
    @IsObject()
    content: Record<string, any>;

    @ApiProperty({
        description: 'Solución del ejercicio en formato JSON',
        example: {
            explanation: 'Se usa "is" para tercera persona singular',
        },
        required: false,
    })
    @IsObject()
    @IsOptional()
    solution?: Record<string, any>;

    @ApiProperty({
        description: 'Puntos que otorga el ejercicio',
        example: 10,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    points: number;

    @ApiProperty({
        description: 'Orden del ejercicio dentro de la lección',
        example: 1,
        minimum: 1,
    })
    @IsNumber()
    @Min(1)
    order: number;

    @ApiProperty({
        description: 'ID de la lección a la que pertenece este ejercicio',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    lessonId: string;
} 