import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { CategoryType, CategoryStatus, CategoryDifficulty } from '../types/category.enum';

export class AvailableCategoryDto {
  @ApiProperty({ description: 'Tipo de categoría', enum: CategoryType, example: CategoryType.GRAMMAR })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiProperty({ description: 'Dificultad de la categoría', enum: CategoryDifficulty, example: CategoryDifficulty.BEGINNER })
  @IsEnum(CategoryDifficulty)
  difficulty: CategoryDifficulty;

  @ApiProperty({ description: 'Estado de la categoría', enum: CategoryStatus, example: CategoryStatus.AVAILABLE })
  @IsEnum(CategoryStatus)
  status: CategoryStatus;

  @ApiProperty({ description: 'Total de lecciones completadas en la categoría', example: 5 })
  lessonsCompleted: number;

  @ApiProperty({ description: 'Total de ejercicios completados en la categoría', example: 30 })
  exercisesCompleted: number;

  @ApiProperty({ description: 'Puntuación promedio en la categoría', example: 85.5 })
  averageScore: number;

  @ApiProperty({ description: 'Tiempo dedicado a la categoría en minutos', example: 300 })
  timeSpentMinutes: number;
}
