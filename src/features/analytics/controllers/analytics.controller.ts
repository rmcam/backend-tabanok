import { Controller, Get, Query } from '@nestjs/common';
import { ContentAnalyticsService } from '../services/content-analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly contentAnalyticsService: ContentAnalyticsService) {}

  @Get('versioning')
  getVersioningMetrics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.contentAnalyticsService.getVersioningMetrics(new Date(startDate), new Date(endDate));
  }

  @Get('contributor')
  getContributorMetrics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.contentAnalyticsService.getContributorMetrics(new Date(startDate), new Date(endDate));
  }

  @Get('quality')
  getQualityMetrics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.contentAnalyticsService.getQualityMetrics(new Date(startDate), new Date(endDate));
  }

  @Get('engagement')
  getEngagementMetrics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.contentAnalyticsService.getEngagementMetrics(new Date(startDate), new Date(endDate));
  }
}
