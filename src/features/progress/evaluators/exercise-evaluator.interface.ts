import { Exercise } from '../../exercises/entities/exercise.entity';

export interface ExerciseEvaluator {
  evaluate(exercise: Exercise, userAnswer: any): number;
}
