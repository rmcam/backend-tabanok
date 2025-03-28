import { Module } from '@nestjs/common';
import { StatisticsModule } from '../statistics/statistics.module';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';

@Module({
    imports: [StatisticsModule],
    controllers: [RecommendationsController],
    providers: [RecommendationsService],
    exports: [RecommendationsService]
})
export class RecommendationsModule { } 