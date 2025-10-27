import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Progress } from './entities/progress.entity';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { UserModuleProgress } from './entities/user-module-progress.entity';
import { UserModuleProgressController } from './user-module-progress.controller';
import { UserModuleProgressService } from './user-module-progress.service';
import { User } from '../../auth/entities/user.entity';
import { Module as CourseModule } from '../module/entities/module.entity'; // Renombrar para evitar conflicto
import { Exercise } from '../exercises/entities/exercise.entity';
import { ExercisesModule } from '../exercises/exercises.module';
import { QuizEvaluator } from './evaluators/quiz-evaluator';
import { ExerciseEvaluatorFactory } from './evaluators/exercise-evaluator.factory';

@Module({
    imports: [
        TypeOrmModule.forFeature([Progress, UserModuleProgress, User, CourseModule, Exercise]),
        ExercisesModule, // Importar ExercisesModule para que ExercisesService esté disponible
    ],
    controllers: [ProgressController, UserModuleProgressController],
    providers: [ProgressService, UserModuleProgressService, QuizEvaluator, ExerciseEvaluatorFactory],
    exports: [ProgressService, UserModuleProgressService],
})
export class ProgressModule { }
