import { Injectable, Type } from '@nestjs/common';
import { ExerciseEvaluator } from './exercise-evaluator.interface';
import { QuizEvaluator } from './quiz-evaluator';
import { ExerciseType } from '../../exercises/enums/exercise-type.enum';

@Injectable()
export class ExerciseEvaluatorFactory {
  private evaluators = new Map<ExerciseType, Type<ExerciseEvaluator>>();

  constructor(
    private readonly quizEvaluator: QuizEvaluator,
  ) {
    this.evaluators.set(ExerciseType.Quiz, QuizEvaluator);
    // Aquí se pueden registrar otros evaluadores
  }

  getEvaluator(type: ExerciseType): ExerciseEvaluator {
    const EvaluatorClass = this.evaluators.get(type);
    if (!EvaluatorClass) {
      throw new Error(`No evaluator found for exercise type: ${type}`);
    }
    // Retorna la instancia ya inyectada por NestJS
    switch (type) {
      case ExerciseType.Quiz:
        return this.quizEvaluator;
      default:
        throw new Error(`No evaluator found for exercise type: ${type}`);
    }
  }
}
