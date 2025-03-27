import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsObject,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    Min,
    ValidateNested,
} from 'class-validator';
import { ActivityType, DifficultyLevel } from '../entities/activity.entity';
import { ActivityContent } from '../interfaces/activity-content.interface';

export class CreateActivityDto {
  @ApiProperty({ example: 'Aprende los saludos básicos' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Practica los saludos más comunes en Kamëntsá' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: ActivityType })
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiProperty({ enum: DifficultyLevel })
  @IsEnum(DifficultyLevel)
  difficultyLevel: DifficultyLevel;

  @ApiProperty({
    example: {
      questions: [
        {
          question: '¿Cómo se dice "hola" en Kamëntsá?',
          options: ['Bëngbe', 'Tsëntsë', 'Bëngbe tsëntsë'],
          correctAnswer: 'Bëngbe',
          points: 10,
        },
      ],
      timeLimit: 300,
      minScore: 70,
      maxAttempts: 3,
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  content: ActivityContent;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  @Max(1000)
  totalPoints: number;

  @ApiProperty({ example: 300 })
  @IsInt()
  @Min(30)
  @Max(3600)
  timeLimit: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  @Max(10)
  maxAttempts: number;

  @ApiProperty({ example: 70 })
  @IsInt()
  @Min(0)
  @Max(100)
  minScoreToPass: number;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID del tema al que pertenece la actividad',
  })
  @IsUUID()
  topicId: string;
}
