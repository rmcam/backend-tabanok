import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from '../../features/activity/entities/activity.entity';
import { Topic } from '../../features/topic/entities/topic.entity';
import { Vocabulary } from '../../features/vocabulary/entities/vocabulary.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Topic, Activity, Vocabulary])
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {} 