import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';
import { CategoryType } from '../types/category.enum';

export class UpdateLearningProgressDto {
  @ApiProperty({ description: 'Indica si la lección ha sido completada', example: true })
  @IsBoolean()
  lessonCompleted: boolean;

  @ApiProperty({ description: 'Indica si el ejercicio ha sido completado', example: false })
  @IsBoolean()
  exerciseCompleted: boolean;

  @ApiProperty({ description: 'Puntuación obtenida', example: 90 })
  @IsNumber()
  score: number;

  @ApiProperty({ description: 'Tiempo dedicado en minutos', example: 30 })
  @IsNumber()
  timeSpentMinutes: number;

  @ApiProperty({ description: 'Categoría del progreso', enum: CategoryType, example: CategoryType.GRAMMAR })
  @IsEnum(CategoryType)
  category: CategoryType;
}
