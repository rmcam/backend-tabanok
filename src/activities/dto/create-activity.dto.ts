import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { ActivityType, DifficultyLevel } from '../entities/activity.entity';

class QuestionDto {
  @ApiProperty({ example: '¿Cómo se dice "hola" en Kamëntsá?' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ example: ['Bëngbe', 'Tsëntsë', 'Bëngbe tsëntsë', 'Tsëntsë bëngbe'] })
  @IsString({ each: true })
  options: string[];

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  correctAnswer: number;
}

class PairDto {
  @ApiProperty({ example: 'Bëngbe' })
  @IsString()
  @IsNotEmpty()
  kamentsa: string;

  @ApiProperty({ example: 'Hola' })
  @IsString()
  @IsNotEmpty()
  spanish: string;
}

class ActivityContentDto {
  @ApiProperty({ type: [QuestionDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions?: QuestionDto[];

  @ApiProperty({ type: [PairDto], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PairDto)
  pairs?: PairDto[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  audioUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class CreateActivityDto {
  @ApiProperty({ example: 'Saludos Básicos' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Aprende los saludos básicos en Kamëntsá' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: ActivityType, example: ActivityType.VOCABULARY_QUIZ })
  @IsEnum(ActivityType)
  type: ActivityType;

  @ApiProperty({ enum: DifficultyLevel, example: DifficultyLevel.BEGINNER })
  @IsEnum(DifficultyLevel)
  difficulty: DifficultyLevel;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => ActivityContentDto)
  content: ActivityContentDto;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  points: number;

  @ApiProperty({ example: 300 })
  @IsInt()
  @Min(0)
  timeLimit: number;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  topicId: string;
} 