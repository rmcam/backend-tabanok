import { Module } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { LessonController } from './lesson.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { Activity } from 'src/features/activity/entities/activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, Activity])],
  controllers: [LessonController],
  providers: [LessonService],
  
})
export class LessonModule {}
