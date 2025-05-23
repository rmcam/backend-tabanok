import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';
import { CategoryType } from '../types/category.enum';

export class NextMilestoneDto {
  @ApiProperty({ description: 'Categoría del hito', enum: CategoryType, example: CategoryType.GRAMMAR })
  @IsEnum(CategoryType)
  category: CategoryType;

  @ApiProperty({ description: 'Nombre del hito', example: 'Completar lección de verbos' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Progreso requerido para alcanzar el hito', example: 100 })
  @IsNumber()
  requiredProgress: number;

  @ApiProperty({ description: 'Progreso actual del usuario en el hito', example: 75 })
  @IsNumber()
  currentProgress: number;
}
