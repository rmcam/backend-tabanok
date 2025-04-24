import { Module } from '@nestjs/common';
import { RecommendationsController } from './controllers/recommendations.controller';
import { RecommendationsService } from './services/recommendations.service';

@Module({
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}
