import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { RecommendationsService } from '../services/recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get(':userId')
  async getRecommendations(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.recommendationsService.getRecommendations(userId);
  }
}
