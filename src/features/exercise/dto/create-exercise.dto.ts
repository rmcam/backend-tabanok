import { ApiProperty } from '@nestjs/swagger';
import {
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';
import { ExerciseType } from '../entities/exercise.entity';

export class CreateExerciseDto {
    @ApiProperty({
        description: 'Título del ejercicio',
        example: 'Conjugación de verbos regulares',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'Descripción detallada del ejercicio',
        example: 'Completa las oraciones con la forma correcta del verbo',
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
            questions: [
                {
                    text: '¿Cuál es la forma correcta?',
                    options: ['comer', 'como', 'comes', 'comemos'],
                },
            ],
        },
    })
    @IsObject()
    content: Record<string, any>;

    @ApiProperty({
        description: 'Solución del ejercicio en formato JSON',
        example: {
            answers: [2], // índice de la respuesta correcta
        },
    })
    @IsObject()
    solution: Record<string, any>;

    @ApiProperty({
        description: 'Puntos que otorga el ejercicio',
        example: 10,
        minimum: 0,
        default: 10,
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    points?: number;

    @ApiProperty({
        description: 'Orden del ejercicio dentro de la lección',
        example: 1,
        minimum: 1,
    })
    @IsNumber()
    @Min(1)
    order: number;

    @ApiProperty({
        description: 'Metadatos adicionales del ejercicio',
        required: false,
        example: {
            difficulty: 'medium',
            tags: ['verbos', 'presente'],
            timeLimit: 300,
        },
    })
    @IsObject()
    @IsOptional()
    metadata?: Record<string, any>;

    @ApiProperty({
        description: 'ID de la lección a la que pertenece el ejercicio',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    lessonId: string;
} 