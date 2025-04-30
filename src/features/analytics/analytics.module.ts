import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './controllers/analytics.controller';
import { ContentAnalyticsService } from './services/content-analytics.service';
import { ContentVersion } from '../content-versioning/entities/content-version.entity';
import { Comment } from '../comments/entities/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContentVersion, Comment])],
  controllers: [AnalyticsController],
  providers: [ContentAnalyticsService],
  exports: [ContentAnalyticsService],
})
export class AnalyticsModule {}
