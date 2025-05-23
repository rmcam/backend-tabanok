import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNumber, IsString, ValidateNested, IsBoolean, IsUUID, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CategoryType, FrequencyType, GoalType } from '../types/category.enum';

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

export class CustomGoalDto {
  @ApiProperty({ description: 'ID único del objetivo personalizado', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Tipo de objetivo', enum: GoalType, example: GoalType.SCORE })
  @IsEnum(GoalType)
  type: GoalType;

  @ApiProperty({ description: 'Meta del objetivo', example: 10 })
  @IsNumber()
  target: number;

  @ApiProperty({ description: 'Frecuencia del objetivo', enum: FrequencyType, example: FrequencyType.DAILY })
  @IsEnum(FrequencyType)
  frequency: FrequencyType;

  @ApiProperty({ description: 'Fecha límite del objetivo', example: '2023-12-31T23:59:59Z' })
  @IsString()
  deadline: string;

  @ApiProperty({ description: 'Descripción del objetivo', example: 'Practicar vocabulario 10 minutos al día' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Indica si el objetivo ha sido completado', example: false })
  @IsBoolean()
  isCompleted: boolean;
}

export class LearningPathDto {
  @ApiProperty({ description: 'Nivel actual del usuario', example: 5 })
  @IsNumber()
  currentLevel: number;

  @ApiProperty({ description: 'Categorías recomendadas para el usuario', enum: CategoryType, isArray: true, example: [CategoryType.GRAMMAR, CategoryType.VOCABULARY] })
  @IsArray()
  @IsEnum(CategoryType, { each: true })
  recommendedCategories: CategoryType[];

  @ApiProperty({ type: [NextMilestoneDto], description: 'Próximos hitos del usuario' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NextMilestoneDto)
  nextMilestones: NextMilestoneDto[];

  @ApiProperty({ type: [CustomGoalDto], description: 'Objetivos personalizados del usuario', required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomGoalDto)
  @IsOptional()
  customGoals?: CustomGoalDto[];
}
