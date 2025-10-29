import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Progress } from './entities/progress.entity';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { User } from '../../auth/entities/user.entity';
import { Module as CourseModule } from '../module/entities/module.entity';
import { Unity } from '../unity/entities/unity.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Exercise } from '../exercises/entities/exercise.entity';
import { ExercisesModule } from '../exercises/exercises.module';
import { QuizEvaluator } from './evaluators/quiz-evaluator';
import { ExerciseEvaluatorFactory } from './evaluators/exercise-evaluator.factory';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserModuleProgress } from './entities/user-module-progress.entity';
import { UserUnityProgress } from './entities/user-unity-progress.entity';
import { UserLessonProgress } from './entities/user-lesson-progress.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Progress,
            User,
            CourseModule,
            Unity,
            Lesson,
            Exercise,
            UserModuleProgress,
            UserUnityProgress,
            UserLessonProgress,
        ]),
        ExercisesModule,
        EventEmitterModule.forRoot(),
    ],
    controllers: [ProgressController],
    providers: [
        ProgressService,
        QuizEvaluator,
        ExerciseEvaluatorFactory
    ],
    exports: [ProgressService],
})
export class ProgressModule { }
