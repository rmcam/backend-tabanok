import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationModule } from '../gamification/gamification.module';
import { TagController } from './controllers/statistics-tag.controller';
import { Statistics } from './entities/statistics.entity';
import { Tag } from './entities/statistics-tag.entity';
import { StatisticsReportService } from './services/statistics-report.service';
import { StatisticsService } from './services/statistics.service';
import { TagService } from './services/tag.service';
import { StatisticsRepository } from './repositories/statistics.repository';
import { LearningProgressReportGenerator } from './services/report-generators/learning-progress-report.generator';
import { AchievementsReportGenerator } from './services/report-generators/achievements-report.generator';
import { PerformanceReportGenerator } from './services/report-generators/performance-report.generator';
import { ComprehensiveReportGenerator } from './services/report-generators/comprehensive-report.generator';

@Module({
    imports: [
        TypeOrmModule.forFeature([Statistics, Tag]),
        forwardRef(() => GamificationModule)
    ],
    controllers: [TagController],
    providers: [
        StatisticsService,
        StatisticsReportService,
        StatisticsRepository,
        LearningProgressReportGenerator,
        AchievementsReportGenerator,
        PerformanceReportGenerator,
        ComprehensiveReportGenerator,
        TagService
    ],
    exports: [StatisticsService, StatisticsRepository, TypeOrmModule]
})
export class StatisticsModule { }
