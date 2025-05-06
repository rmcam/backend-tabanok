import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { Progress } from '../../features/progress/entities/progress.entity';
import { User } from '../../auth/entities/user.entity';
import { Exercise } from '../../features/exercises/entities/exercise.entity';

export class ProgressSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const progressRepository = this.dataSource.getRepository(Progress);
    const userRepository = this.dataSource.getRepository(User);
    const exerciseRepository = this.dataSource.getRepository(Exercise);

    const users = await userRepository.find();
    const exercises = await exerciseRepository.find();

    if (users.length === 0) {
      console.log('No users found. Skipping ProgressSeeder.');
      return;
    }

    if (exercises.length === 0) {
        console.log('No exercises found. Skipping ProgressSeeder.');
        return;
    }

    const progressToSeed = [];

    // Crear progreso para cada usuario y un número aleatorio de ejercicios
    for (const user of users) {
      const numberOfExercisesToSeed = Math.floor(Math.random() * Math.min(exercises.length, 10)) + 1; // Sembrar progreso para hasta 10 ejercicios por usuario
      const shuffledExercises = exercises.sort(() => 0.5 - Math.random()); // Mezclar ejercicios para variar cuáles se siembran

      for (let i = 0; i < numberOfExercisesToSeed; i++) {
        const exercise = shuffledExercises[i];
        const isCompleted = Math.random() > 0.3; // Mayor probabilidad de estar completado
        const score = isCompleted ? Math.floor(Math.random() * 41) + 60 : Math.floor(Math.random() * 60); // Puntuación más alta si está completado
        const answers = {
          // Datos de respuestas de ejemplo más variados
          attempted: Math.floor(Math.random() * 5) + 1,
          correct: isCompleted ? Math.floor(score / 10) : Math.floor(Math.random() * (score / 10)),
          submissionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Fecha de envío reciente
        };

        progressToSeed.push({
          user: user,
          exercise: exercise,
          score: score,
          isCompleted: isCompleted,
          answers: answers,
        });
      }
    }

    for (const progressData of progressToSeed) {
      // Buscar si ya existe un registro de progreso para este usuario y ejercicio
      const existingProgress = await progressRepository.findOne({
        where: {
          user: { id: progressData.user.id },
          exercise: { id: progressData.exercise.id },
        } as any, // Usar 'as any' temporalmente si hay problemas de tipo con la condición where
        relations: ['user', 'exercise'], // Cargar explícitamente las relaciones 'user' y 'exercise'
      });

      if (!existingProgress) {
        const newProgress = progressRepository.create(progressData);
        await progressRepository.save(newProgress);
        console.log(`Progress for User ID ${progressData.user.id} and Exercise ID ${progressData.exercise.id} seeded.`);
      } else {
        console.log(`Progress for User ID ${existingProgress.user.id} and Exercise ID ${existingProgress.exercise.id} already exists. Skipping.`);
      }
    }
  }
}
