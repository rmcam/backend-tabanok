import { Injectable } from '@nestjs/common';
import { ReportGenerator } from '../../interfaces/report-generator.interface';
import { Statistics } from '../../entities/statistics.entity';

@Injectable()
export class AchievementsReportGenerator implements ReportGenerator {
    async generateReport(statistics: Statistics, dateRange: any): Promise<any> {
        // Implementación del reporte de logros
        return {};
    }
}
