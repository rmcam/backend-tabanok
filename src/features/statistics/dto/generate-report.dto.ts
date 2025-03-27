import { IsArray, IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

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
    @IsUUID()
    userId: string;

    @IsEnum(ReportType)
    reportType: ReportType;

    @IsEnum(TimeFrame)
    timeFrame: TimeFrame;

    @IsOptional()
    @IsDateString()
    startDate?: Date;

    @IsOptional()
    @IsDateString()
    endDate?: Date;

    @IsOptional()
    @IsArray()
    categories?: string[];
} 