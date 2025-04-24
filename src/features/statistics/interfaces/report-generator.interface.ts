import { Statistics } from '../entities/statistics.entity';
import { GenerateReportDto } from '../dto/statistics-report.dto';
import { CategoryType } from '../types/category.enum';

export interface ReportGenerator {
    generateReport(statistics: Statistics, dateRange: any, categories?: CategoryType[]): Promise<any>;
}
