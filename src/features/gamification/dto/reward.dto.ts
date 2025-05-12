import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { RewardTrigger, RewardType, RewardStatus } from '../../../common/enums/reward.enum';

export class RewardConditionDto {
    @IsString()
    type: string;

    @IsNumber()
    value: number;

    @IsString()
    description: string;
}

export class RewardValueDto {
    @IsString()
    type: string;

    @IsObject()
    value: any;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;
}

export class CreateRewardDto {
    @IsString()
    name: string;

    @IsString()
    description: string;

    @IsEnum(RewardType)
    type: RewardType;

    @IsEnum(RewardTrigger)
    trigger: RewardTrigger;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => RewardConditionDto)
    conditions: RewardConditionDto[];

    @ValidateNested()
    @Type(() => RewardValueDto)
    rewardValue: RewardValueDto;

    @IsOptional()
    @IsBoolean()
    isLimited?: boolean;

    @IsOptional()
    @IsNumber()
    limitedQuantity?: number;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    startDate?: Date;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    endDate?: Date;
}

export class RewardFilterDto {
    @IsOptional()
    @IsEnum(RewardType)
    type?: RewardType;

    @IsOptional()
    @IsEnum(RewardTrigger)
    trigger?: RewardTrigger;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class UserRewardFilterDto {
    @IsOptional()
    @IsEnum(RewardStatus)
    status?: RewardStatus;
}

export class RewardResponseDto {
    id: string;
    name: string;
    description: string;
    type: RewardType;
    trigger: RewardTrigger;
    conditions: RewardConditionDto[];
    rewardValue: RewardValueDto;
    isActive: boolean;
    isLimited: boolean;
    limitedQuantity?: number;
    timesAwarded: number;
    startDate?: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}
