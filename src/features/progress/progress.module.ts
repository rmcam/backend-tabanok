import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Progress } from './entities/progress.entity';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { UserModuleProgress } from './entities/user-module-progress.entity';
import { UserUnityProgress } from './entities/user-unity-progress.entity'; // Nueva entidad
import { UserLessonProgress } from './entities/user-lesson-progress.entity'; // Nueva entidad
import { UserModuleProgressController } from './user-module-progress.controller';
import { UserUnityProgressController } from './user-unity-progress.controller'; // Nuevo controlador
import { UserLessonProgressController } from './user-lesson-progress.controller'; // Nuevo controlador
import { UserModuleProgressService } from './user-module-progress.service';
import { UserUnityProgressService } from './user-unity-progress.service'; // Nuevo servicio
import { UserLessonProgressService } from './user-lesson-progress.service'; // Nuevo servicio
import { User } from '../../auth/entities/user.entity';
import { Module as CourseModule } from '../module/entities/module.entity'; // Renombrar para evitar conflicto
import { Unity } from '../unity/entities/unity.entity'; // Nueva entidad
import { Lesson } from '../lesson/entities/lesson.entity'; // Nueva entidad
import { Exercise } from '../exercises/entities/exercise.entity';
import { ExercisesModule } from '../exercises/exercises.module';
import { QuizEvaluator } from './evaluators/quiz-evaluator';
import { ExerciseEvaluatorFactory } from './evaluators/exercise-evaluator.factory';

@Module({
    imports: [
        TypeOrmModule.forFeature([Progress, UserModuleProgress, UserUnityProgress, UserLessonProgress, User, CourseModule, Unity, Lesson, Exercise]),
        ExercisesModule, // Importar ExercisesModule para que ExercisesService esté disponible
    ],
    controllers: [ProgressController, UserModuleProgressController, UserUnityProgressController, UserLessonProgressController],
    providers: [
        ProgressService,
        UserModuleProgressService,
        UserUnityProgressService,
        UserLessonProgressService,
        QuizEvaluator,
        ExerciseEvaluatorFactory
    ],
    exports: [ProgressService, UserModuleProgressService, UserUnityProgressService, UserLessonProgressService],
})
export class ProgressModule { }
