import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Level } from '../level/entities/level.entity';
import { Lesson } from './entities/lesson.entity';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, Level])],
  controllers: [LessonController],
  providers: [LessonService],
  exports: [LessonService]
})
export class LessonModule { }
