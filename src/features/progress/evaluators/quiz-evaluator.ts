import { Injectable } from '@nestjs/common';
import { ExerciseEvaluator } from './exercise-evaluator.interface';
import { Exercise } from '../../exercises/entities/exercise.entity';

@Injectable()
export class QuizEvaluator implements ExerciseEvaluator {
  evaluate(exercise: Exercise, userAnswer: any): number {
    if (!exercise.content) {
      return 0;
    }

    let score = 0;
    const exercisePoints = exercise.points || 100; // Usar los puntos del ejercicio o un valor predeterminado

    // Lógica para quizzes con una única respuesta en 'answer'
    if (exercise.content.answer !== undefined && exercise.content.answer !== null) {
      const correctAnswer = String(exercise.content.answer);
      const submittedAnswer = String(userAnswer.userAnswer); // Asumimos que userAnswer es { userAnswer: "..." }

      if (submittedAnswer === correctAnswer) {
        score = exercisePoints;
      } else {
        score = 0;
      }
    }
    // Lógica para ejercicios con múltiples respuestas en 'correctAnswers' (si aplica en el futuro)
    else if (exercise.content.correctAnswers) {
      const correctAnswers = exercise.content.correctAnswers;

      if (Array.isArray(userAnswer.userAnswer) && Array.isArray(correctAnswers)) {
        const correctSet = new Set(correctAnswers.map(String));
        const userSet = new Set(userAnswer.userAnswer.map(String));

        const intersection = new Set([...correctSet].filter(x => userSet.has(x)));
        // const union = new Set([...correctSet, ...userSet]); // No es necesario para el cálculo de score

        if (correctSet.size === 0) { // Evitar división por cero si no hay respuestas correctas definidas
          return 0;
        }

        score = (intersection.size / correctSet.size) * exercisePoints;
      } else if (userAnswer.userAnswer !== undefined && userAnswer.userAnswer !== null) {
        if (String(userAnswer.userAnswer) === String(correctAnswers)) {
          score = exercisePoints;
        }
      }
    } else {
      // Si no hay 'answer' ni 'correctAnswers', no se puede evaluar
      return 0;
    }

    return score;
  }
}
