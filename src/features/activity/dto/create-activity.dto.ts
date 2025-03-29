import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
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
        required: false,
    })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({
        description: 'El tipo de actividad',
        enum: ActivityType,
        example: ActivityType.INTERACTIVE,
        default: ActivityType.INTERACTIVE,
    })
    @IsEnum(ActivityType)
    type: ActivityType;

    @ApiProperty({
        description: 'El nivel de dificultad',
        enum: DifficultyLevel,
        example: DifficultyLevel.BEGINNER,
        default: DifficultyLevel.BEGINNER,
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
        default: 0,
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    points?: number;

    @ApiProperty({
        description: 'Metadatos adicionales de la actividad',
        example: { duration: '30m', tags: ['vocabulary', 'beginner'] },
        required: false,
    })
    @IsOptional()
    metadata?: Record<string, any>;

    @ApiProperty({
        description: 'Estado de la actividad',
        default: true,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
} 