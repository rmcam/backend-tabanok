import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min, ValidateNested } from 'class-validator';
import { AchievementCategory, AchievementTier } from '../entities/cultural-achievement.entity';

export class RequirementDto {
    @ApiProperty({ description: 'Tipo de requisito (ej: "practice", "complete_lesson")' })
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty({ description: 'Valor numérico del requisito', minimum: 1 })
    @IsNumber()
    @Min(1)
    value: number;

    @ApiProperty({ description: 'Descripción detallada del requisito' })
    @IsString()
    @IsNotEmpty()
    description: string;
}

export class RewardDto {
    @ApiProperty({ description: 'Tipo de recompensa (ej: "points", "badge", "item")' })
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty({ description: 'Descripción de la recompensa' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ description: 'Valor de la recompensa (puede ser cualquier tipo)', example: { points: 100 } })
    value: any;
}

export class CreateAchievementDto {
    @ApiProperty({ description: 'Nombre del logro cultural' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Descripción detallada del logro' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({
        description: 'Categoría del logro cultural',
        enum: AchievementCategory,
        example: AchievementCategory.LENGUA
    })
    @IsEnum(AchievementCategory)
    category: AchievementCategory;

    @ApiProperty({
        description: 'Nivel de dificultad del logro',
        enum: AchievementTier,
        example: AchievementTier.BRONCE
    })
    @IsEnum(AchievementTier)
    tier: AchievementTier;

    @ApiProperty({
        type: [RequirementDto],
        description: 'Lista de requisitos para obtener el logro'
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RequirementDto)
    requirements: RequirementDto[];

    @ApiProperty({
        description: 'Cantidad de puntos otorgados al completar el logro',
        minimum: 1
    })
    @IsNumber()
    @Min(1)
    pointsReward: number;

    @ApiProperty({
        type: [RewardDto],
        description: 'Recompensas adicionales al completar el logro',
        required: false
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RewardDto)
    additionalRewards?: RewardDto[];

    @ApiProperty({
        description: 'URL de la imagen asociada al logro',
        required: false
    })
    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @ApiProperty({
        description: 'Indica si el logro es secreto',
        default: false
    })
    @IsOptional()
    @IsBoolean()
    isSecret?: boolean;
}

export class ProgressUpdateDto {
    @ApiProperty({ description: 'Tipo de progreso a actualizar' })
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty({ description: 'Valor numérico del progreso' })
    @IsNumber()
    @Min(0)
    value: number;
}

export class AchievementFilterDto {
    @ApiProperty({ description: 'Categoría del logro', required: false })
    @IsEnum(AchievementCategory)
    @IsOptional()
    category?: AchievementCategory;

    @ApiProperty({ description: 'Nivel del logro', required: false })
    @IsEnum(AchievementTier)
    @IsOptional()
    tier?: AchievementTier;

    @ApiProperty({ description: 'Estado de completado', required: false })
    @IsOptional()
    @IsBoolean()
    isCompleted?: boolean;
}

export class UpdateProgressDto {
    @ApiProperty({
        type: [ProgressUpdateDto],
        description: 'Lista de actualizaciones de progreso'
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProgressUpdateDto)
    updates: ProgressUpdateDto[];
} 