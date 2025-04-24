import { Injectable } from '@nestjs/common';
import { ReportGenerator } from '../../interfaces/report-generator.interface';
import { Statistics } from '../../entities/statistics.entity';
import { CategoryType } from '../../types/category.enum';

@Injectable()
export class LearningProgressReportGenerator implements ReportGenerator {
    async generateReport(statistics: Statistics, dateRange: any, categories?: CategoryType[]): Promise<any> {
        // Implementación del reporte de progreso de aprendizaje
        return {};
    }
}
