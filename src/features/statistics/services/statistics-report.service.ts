import { Injectable } from '@nestjs/common';
import { GenerateReportDto, ReportType } from '../dto/statistics-report.dto';
import { Statistics } from '../entities/statistics.entity';
import { CategoryType } from '../types/category.enum';
import { LearningProgressReportGenerator } from './report-generators/learning-progress-report.generator';
import { AchievementsReportGenerator } from './report-generators/achievements-report.generator';
import { PerformanceReportGenerator } from './report-generators/performance-report.generator';
import { ComprehensiveReportGenerator } from './report-generators/comprehensive-report.generator';

@Injectable()
export class StatisticsReportService {
    constructor(
        private readonly learningProgressReportGenerator: LearningProgressReportGenerator,
        private readonly achievementsReportGenerator: AchievementsReportGenerator,
        private readonly performanceReportGenerator: PerformanceReportGenerator,
        private readonly comprehensiveReportGenerator: ComprehensiveReportGenerator,
    ) { }

    async generateReport(statistics: Statistics, generateReportDto: GenerateReportDto): Promise<any> {
        const { reportType, timeFrame, startDate, endDate, categories } = generateReportDto;
        let reportData: any = {};
        const dateRange = this.getDateRange(timeFrame, startDate, endDate);
        const typedCategories = categories?.map(cat => cat as CategoryType);

        switch (reportType) {
            case ReportType.LEARNING_PROGRESS:
                reportData = await this.learningProgressReportGenerator.generateReport(statistics, dateRange, typedCategories);
                break;
            case ReportType.ACHIEVEMENTS:
                reportData = await this.achievementsReportGenerator.generateReport(statistics, dateRange);
                break;
            case ReportType.PERFORMANCE:
                reportData = await this.performanceReportGenerator.generateReport(statistics, dateRange, typedCategories);
                break;
            case ReportType.COMPREHENSIVE:
                reportData = await this.comprehensiveReportGenerator.generateReport(statistics, dateRange, typedCategories);
                break;
        }

        return {
            userId: generateReportDto.userId,
            reportType,
            timeFrame,
            dateRange,
            generatedAt: new Date(),
            data: reportData
        };
    }

    private getDateRange(timeFrame: string, startDate?: Date, endDate?: Date): { start: Date; end: Date } {
        const end = endDate ? new Date(endDate) : new Date();
        let start: Date;

        switch (timeFrame) {
            case 'WEEKLY':
                start = new Date(end);
                start.setDate(end.getDate() - 7);
                break;
            case 'MONTHLY':
                start = new Date(end);
                start.setMonth(end.getMonth() - 1);
                break;
            case 'YEARLY':
                start = new Date(end);
                start.setFullYear(end.getFullYear() - 1);
                break;
            case 'CUSTOM':
                if (!startDate) throw new Error('Start date is required for custom time frame');
                start = new Date(startDate);
                break;
            default:
                start = new Date(end);
                start.setDate(end.getDate() - 7);
        }

        return { start, end };
    }
}
