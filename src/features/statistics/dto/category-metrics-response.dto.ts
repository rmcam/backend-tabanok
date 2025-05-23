import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { CategoryType } from '../types/category.enum';

export class CategoryMetricsResponseDto {
  @ApiProperty({ description: 'Tipo de categoría', enum: CategoryType, example: CategoryType.GRAMMAR })
  @IsEnum(CategoryType)
  type: CategoryType;

  @ApiProperty({ description: 'Total de lecciones completadas en la categoría', example: 5 })
  lessonsCompleted: number;

  @ApiProperty({ description: 'Total de ejercicios completados en la categoría', example: 20 })
  exercisesCompleted: number;

  @ApiProperty({ description: 'Puntuación promedio en la categoría', example: 85.7 })
  averageScore: number;

  @ApiProperty({ description: 'Tiempo dedicado a la categoría en minutos', example: 300 })
  timeSpentMinutes: number;
}
