import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { CategoryType } from '../interfaces/category.interface';

export enum ReportType {
    LEARNING_PROGRESS = 'LEARNING_PROGRESS',
    ACHIEVEMENTS = 'ACHIEVEMENTS',
    PERFORMANCE = 'PERFORMANCE',
    COMPREHENSIVE = 'COMPREHENSIVE'
}

export enum TimeFrame {
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY',
    YEARLY = 'YEARLY',
    CUSTOM = 'CUSTOM'
}

export class GenerateReportDto {
    @ApiProperty({
        description: 'ID del usuario para generar el reporte',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @IsUUID()
    userId: string;

    @ApiProperty({
        description: 'Tipo de reporte a generar',
        enum: ReportType,
        example: ReportType.COMPREHENSIVE
    })
    @IsEnum(ReportType)
    reportType: ReportType;

    @ApiProperty({
        description: 'Marco temporal del reporte',
        enum: TimeFrame,
        example: TimeFrame.MONTHLY
    })
    @IsEnum(TimeFrame)
    timeFrame: TimeFrame;

    @ApiProperty({
        description: 'Fecha de inicio para reportes personalizados',
        required: false
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    startDate?: Date;

    @ApiProperty({
        description: 'Fecha de fin para reportes personalizados',
        required: false
    })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    endDate?: Date;

    @ApiProperty({
        description: 'Categorías específicas para filtrar el reporte',
        required: false,
        enum: CategoryType,
        isArray: true,
        example: [CategoryType.VOCABULARY, CategoryType.GRAMMAR]
    })
    @IsOptional()
    @IsArray()
    @IsEnum(CategoryType, { each: true })
    categories?: CategoryType[];
} 