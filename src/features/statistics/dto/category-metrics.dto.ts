import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsDateString, IsArray, IsObject } from 'class-validator';
import { CategoryType, CategoryDifficulty, CategoryStatus } from '../types/category.enum';

export class CategoryProgressDto {
  @ApiProperty({ description: 'Total de ejercicios en la categoría', example: 10 })
  @IsNumber()
  totalExercises: number;

  @ApiProperty({ description: 'Ejercicios completados en la categoría', example: 7 })
  @IsNumber()
  completedExercises: number;

  @ApiProperty({ description: 'Puntuación promedio en la categoría', example: 85.5 })
  @IsNumber()
  averageScore: number;

  @ApiProperty({ description: 'Tiempo total dedicado a la categoría en minutos', example: 120 })
  @IsNumber()
  timeSpentMinutes: number;

  @ApiProperty({ description: 'Fecha de la última práctica en la categoría', example: '2023-10-25T14:30:00Z', nullable: true })
  @IsOptional()
  @IsDateString()
  lastPracticed: string | null;

  @ApiProperty({ description: 'Nivel de maestría en la categoría', example: 0.75 })
  @IsNumber()
  masteryLevel: number;

  @ApiProperty({ description: 'Racha actual en la categoría', example: 5 })
  @IsNumber()
  streak: number;
}

export class CategoryMetricsDto {
  @ApiProperty({ description: 'Tipo de categoría', enum: CategoryType, example: CategoryType.GRAMMAR })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiProperty({ description: 'Dificultad de la categoría', enum: CategoryDifficulty, example: CategoryDifficulty.BEGINNER })
  @IsEnum(CategoryDifficulty)
  difficulty: CategoryDifficulty;

  @ApiProperty({ description: 'Estado de la categoría', enum: CategoryStatus, example: CategoryStatus.AVAILABLE })
  @IsEnum(CategoryStatus)
  status: CategoryStatus;

  @ApiProperty({ type: CategoryProgressDto, description: 'Progreso detallado de la categoría' })
  progress: CategoryProgressDto;

  @ApiProperty({ description: 'Categorías prerrequisito', type: [String], enum: CategoryType, example: [CategoryType.VOCABULARY] })
  @IsArray()
  @IsEnum(CategoryType, { each: true })
  prerequisites: CategoryType[];

  @ApiProperty({
    description: 'Requisitos para desbloquear la categoría',
    type: 'object',
    properties: {
      requiredScore: { type: 'number', example: 70 },
      requiredCategories: { type: 'array', items: { type: 'string', enum: Object.values(CategoryType) }, example: [CategoryType.VOCABULARY] },
    },
  })
  @IsObject()
  unlockRequirements: {
    requiredScore: number;
    requiredCategories: CategoryType[];
  };

  @ApiProperty({ description: 'Subcategorías disponibles', type: [String], example: ['sustantivos', 'verbos'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subCategories?: string[];
}
