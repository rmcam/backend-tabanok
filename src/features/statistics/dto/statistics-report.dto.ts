import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { CategoryType } from '../types/category.enum';

export enum ReportType {
    LEARNING_PROGRESS = 'learning_progress',
    ACHIEVEMENTS = 'achievements',
    PERFORMANCE = 'performance',
    COMPREHENSIVE = 'comprehensive'
}

export enum TimeFrame {
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    YEARLY = 'yearly',
    CUSTOM = 'custom'
}

export class GenerateReportDto {
    @ApiProperty()
    @IsUUID()
    userId: string;

    @ApiProperty({ enum: ReportType })
    @IsEnum(ReportType)
    reportType: ReportType;

    @ApiProperty({ enum: TimeFrame })
    @IsEnum(TimeFrame)
    timeFrame: TimeFrame;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDate()
    startDate?: Date;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDate()
    endDate?: Date;

    @ApiProperty({ type: [String], enum: CategoryType, required: false })
    @IsOptional()
    @IsArray()
    @IsEnum(CategoryType, { each: true })
    categories?: CategoryType[];
} 