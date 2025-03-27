import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ActivityType, DifficultyLevel } from '../entities/activity.entity';

export class CreateActivityDto {
    @ApiProperty({
        description: 'El título de la actividad',
        example: 'Vocabulario básico',
    })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({
        description: 'La descripción de la actividad',
        example: 'Aprende el vocabulario básico del idioma',
    })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        description: 'El tipo de actividad',
        enum: ActivityType,
        example: ActivityType.VOCABULARY,
    })
    @IsEnum(ActivityType)
    type: ActivityType;

    @ApiProperty({
        description: 'El nivel de dificultad',
        enum: DifficultyLevel,
        example: DifficultyLevel.BEGINNER,
    })
    @IsEnum(DifficultyLevel)
    difficulty: DifficultyLevel;

    @ApiProperty({
        description: 'El contenido de la actividad',
        example: {
            words: ['casa', 'perro', 'gato'],
            translations: ['house', 'dog', 'cat'],
        },
    })
    @IsNotEmpty()
    content: Record<string, any>;

    @ApiProperty({
        description: 'Los puntos que otorga la actividad',
        example: 10,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    points: number;

    @ApiProperty({
        description: 'Metadatos adicionales de la actividad',
        example: { duration: '30m', tags: ['vocabulary', 'beginner'] },
        required: false,
    })
    @IsOptional()
    metadata?: Record<string, any>;
} 