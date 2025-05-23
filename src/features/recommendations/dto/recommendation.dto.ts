import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CategoryType } from '../../statistics/types/category.enum';

export enum RecommendationType {
    NEXT_LESSON = 'NEXT_LESSON',
    PRACTICE = 'PRACTICE',
    REVIEW = 'REVIEW',
    CHALLENGE = 'CHALLENGE',
    EXPLORATION = 'EXPLORATION'
}

export enum RecommendationPriority {
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW'
}

export class LearningPatternDto {
    @ApiProperty({ description: 'Hora preferida del día para aprender', example: 'morning' })
    @IsString()
    preferredTimeOfDay: string;

    @ApiProperty({ description: 'Duración promedio de la sesión en minutos', example: 30 })
    @IsNumber()
    averageSessionDuration: number;

    @ApiProperty({ description: 'Categorías más fuertes del usuario', enum: CategoryType, isArray: true })
    @IsArray()
    @IsEnum(CategoryType, { each: true })
    strongestCategories: CategoryType[];

    @ApiProperty({ description: 'Categorías más débiles del usuario', enum: CategoryType, isArray: true })
    @IsArray()
    @IsEnum(CategoryType, { each: true })
    weakestCategories: CategoryType[];

    @ApiProperty({ description: 'Tasa de finalización de contenido', example: 0.85 })
    @IsNumber()
    completionRate: number;

    @ApiProperty({ description: 'Puntuación de consistencia de estudio', example: 0.75 })
    @IsNumber()
    consistencyScore: number;
}

export class RecentProgressDto {
    @ApiProperty({ description: 'Categoría del progreso reciente', enum: CategoryType })
    @IsEnum(CategoryType)
    category: CategoryType;

    @ApiProperty({ description: 'Puntuación obtenida en la categoría', example: 90 })
    @IsNumber()
    score: number;

    @ApiProperty({ description: 'Marca de tiempo del progreso', example: '2023-10-26T10:00:00Z' })
    @IsString() // Usar string para Date en DTOs de entrada/salida para Swagger
    timestamp: Date;
}

export class CurrentGoalDto {
    @ApiProperty({ description: 'Categoría del objetivo', enum: CategoryType })
    @IsEnum(CategoryType)
    category: CategoryType;

    @ApiProperty({ description: 'Meta del objetivo', example: 100 })
    @IsNumber()
    target: number;

    @ApiProperty({ description: 'Fecha límite del objetivo', example: '2023-12-31T23:59:59Z' })
    @IsString() // Usar string para Date en DTOs de entrada/salida para Swagger
    deadline: Date;
}

export class RecommendationCriteriaDto {
    @ApiProperty({ description: 'Nivel actual del usuario', example: 10 })
    @IsNumber()
    userLevel: number;

    @ApiProperty({ type: [RecentProgressDto], description: 'Progreso reciente del usuario' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RecentProgressDto)
    recentProgress: RecentProgressDto[];

    @ApiProperty({ type: LearningPatternDto, description: 'Patrón de aprendizaje del usuario' })
    @ValidateNested()
    @Type(() => LearningPatternDto)
    learningPattern: LearningPatternDto;

    @ApiProperty({ description: 'Tiempo disponible del usuario en minutos', example: 60 })
    @IsNumber()
    availableTime: number;

    @ApiProperty({ type: [CurrentGoalDto], description: 'Objetivos actuales del usuario' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CurrentGoalDto)
    currentGoals: CurrentGoalDto[];
}

export class PrerequisiteDto {
    @ApiProperty({ description: 'Categoría del prerrequisito', enum: CategoryType })
    @IsEnum(CategoryType)
    category: CategoryType;

    @ApiProperty({ description: 'Puntuación mínima requerida en la categoría', example: 70 })
    @IsNumber()
    minimumScore: number;
}

export class ExpectedOutcomeDto {
    @ApiProperty({ description: 'Habilidad a mejorar', example: 'vocabulario' })
    @IsString()
    skill: string;

    @ApiProperty({ description: 'Mejora esperada en porcentaje', example: 0.15 })
    @IsNumber()
    improvement: number;
}

export class AdaptiveFeedbackDto {
    @ApiProperty({ description: 'Condición para el feedback adaptativo', example: 'si el usuario falla 3 veces' })
    @IsString()
    condition: string;

    @ApiProperty({ description: 'Acción alternativa sugerida', example: 'recomendar lección de repaso' })
    @IsString()
    alternativeAction: string;
}

export class RecommendationDto {
    @ApiProperty({ description: 'ID único de la recomendación', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
    @IsUUID()
    id: string;

    @ApiProperty({ description: 'Tipo de recomendación', enum: RecommendationType, example: RecommendationType.NEXT_LESSON })
    @IsEnum(RecommendationType)
    type: RecommendationType;

    @ApiProperty({ description: 'Prioridad de la recomendación', enum: RecommendationPriority, example: RecommendationPriority.HIGH })
    @IsEnum(RecommendationPriority)
    priority: RecommendationPriority;

    @ApiProperty({ description: 'Categoría de la recomendación', enum: CategoryType, example: CategoryType.GRAMMAR })
    @IsEnum(CategoryType)
    category: CategoryType;

    @ApiProperty({ description: 'Duración estimada en minutos', example: 45 })
    @IsNumber()
    estimatedDuration: number;

    @ApiProperty({ description: 'Nivel de dificultad de la recomendación (1-5)', example: 3 })
    @IsNumber()
    @Min(1)
    @Max(5)
    difficulty: number;

    @ApiProperty({ description: 'Descripción de la recomendación', example: 'Lección sobre verbos irregulares' })
    @IsString()
    description: string;

    @ApiProperty({ description: 'Razón de la recomendación', example: 'Basado en tu progreso reciente en gramática' })
    @IsString()
    reason: string;

    @ApiProperty({ type: [PrerequisiteDto], description: 'Prerrequisitos para la recomendación', required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PrerequisiteDto)
    @IsOptional()
    prerequisites?: PrerequisiteDto[];

    @ApiProperty({ type: [ExpectedOutcomeDto], description: 'Resultados esperados de la recomendación', required: false })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ExpectedOutcomeDto)
    @IsOptional()
    expectedOutcomes?: ExpectedOutcomeDto[];

    @ApiProperty({ type: AdaptiveFeedbackDto, description: 'Feedback adaptativo para la recomendación', required: false })
    @ValidateNested()
    @Type(() => AdaptiveFeedbackDto)
    @IsOptional()
    adaptiveFeedback?: AdaptiveFeedbackDto;
}
