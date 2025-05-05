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

    // Crear progreso para cada usuario y algunos ejercicios
    for (const user of users) {
      // Crear progreso para los primeros 2 ejercicios para cada usuario
      for (let i = 0; i < Math.min(exercises.length, 2); i++) {
        const exercise = exercises[i];
        progressToSeed.push({
          user: user,
          exercise: exercise,
          score: Math.floor(Math.random() * 100), // Puntuación aleatoria de ejemplo
          isCompleted: Math.random() > 0.5, // Completado aleatoriamente
          answers: { example: 'data' }, // Datos de respuestas de ejemplo
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
