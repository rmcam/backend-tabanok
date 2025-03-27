import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from '../lesson/entities/lesson.entity';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';
import { Exercise } from './entities/exercise.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Exercise, Lesson])],
    controllers: [ExerciseController],
    providers: [ExerciseService],
    exports: [ExerciseService],
}) 