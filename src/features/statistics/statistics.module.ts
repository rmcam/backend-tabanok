import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationModule } from '../gamification/gamification.module';
import { StatisticsController } from './controllers/statistics.controller';
import { Statistics } from './entities/statistics.entity';
import { StatisticsReportService } from './services/statistics-report.service';
import { StatisticsService } from './services/statistics.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Statistics]),
        GamificationModule
    ],
    controllers: [StatisticsController],
    providers: [
        StatisticsService,
        StatisticsReportService
    ],
    exports: [StatisticsService]
})
export class StatisticsModule { } 