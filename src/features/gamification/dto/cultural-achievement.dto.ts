import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUrl, Min, ValidateNested } from 'class-validator';
import { AchievementCategory, AchievementTier } from '../entities/cultural-achievement.entity';

export class RequirementDto {
    @IsString()
    type: string;

    @IsNumber()
    @Min(1)
    value: number;

    @IsString()
    description: string;
}

export class RewardDto {
    @IsString()
    type: string;

    @IsString()
    description: string;

    value: any; // Permitimos cualquier tipo de valor para flexibilidad
}

export class CreateAchievementDto {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsEnum(AchievementCategory)
    category: AchievementCategory;

    @IsEnum(AchievementTier)
    tier: AchievementTier;

    @IsArray()
    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @Type(() => RequirementDto)
    requirements: RequirementDto[];

    @IsNumber()
    @Min(1)
    pointsReward: number;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RewardDto)
    additionalRewards?: RewardDto[];

    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @IsOptional()
    @IsBoolean()
    isSecret?: boolean;
}

export class UpdateProgressDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProgressUpdateDto)
    updates: ProgressUpdateDto[];
}

export class ProgressUpdateDto {
    @IsString()
    type: string;

    @IsNumber()
    @Min(0)
    value: number;
}

export class AchievementFilterDto {
    @IsOptional()
    @IsEnum(AchievementCategory)
    category?: AchievementCategory;
} 