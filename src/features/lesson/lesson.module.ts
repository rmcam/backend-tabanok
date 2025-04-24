import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { MultimediaModule } from '../multimedia/multimedia.module';

@Module({
    imports: [TypeOrmModule.forFeature([Lesson]), MultimediaModule],
    controllers: [LessonController],
    providers: [LessonService],
    exports: [LessonService],
})
export class LessonModule { }
