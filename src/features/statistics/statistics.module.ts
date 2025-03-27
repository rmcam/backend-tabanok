import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GamificationModule } from '../gamification/gamification.module';
import { Statistics } from './entities/statistics.entity';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Statistics]),
        GamificationModule,
    ],
    controllers: [StatisticsController],
    providers: [StatisticsService],
    exports: [StatisticsService],
})
export class StatisticsModule { } 