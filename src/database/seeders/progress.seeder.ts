import { DataSourceAwareSeed } from './data-source-aware-seed'; 
import { DataSource } from 'typeorm';
import { Progress } from '../../features/progress/entities/progress.entity';
import { User } from '../../auth/entities/user.entity';
import { Exercise } from '../../features/exercises/entities/exercise.entity';
import { UserRole } from '../../auth/enums/auth.enum'; // Import UserRole

export class ProgressSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    // Get repositories bound to the current transaction manager
    const userRepository = this.dataSource.manager.getRepository(User);
    const progressRepository = this.dataSource.manager.getRepository(Progress);

    // Clear existing progress to prevent conflicts
    console.log('[ProgressSeeder] Clearing existing progress...');
    // Use the manager from the current transaction
    console.log('[ProgressSeeder] Existing progress cleared.');

    const users = await userRepository.find();
    if (users.length === 0) {
      console.log('No users found. Skipping ProgressSeeder.');
      return;
    }

    const MAX_RETRIES = 10; // Increased retries
    const RETRY_DELAY_MS = 5000; // 5 seconds

    // Get the exercise repository from the data source
    // Get the exercise repository bound to the current transaction manager
    const exerciseRepository = this.dataSource.manager.getRepository(Exercise);

    let exercises: Exercise[] = [];

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      console.log(`[ProgressSeeder] Attempt ${attempt} to fetch exercises...`);
      try {
        exercises = await exerciseRepository.find();
        if (exercises.length > 0) {
          console.log(`[ProgressSeeder] Found ${exercises.length} exercises on attempt ${attempt}.`);
          break;
        }
        if (attempt < MAX_RETRIES) {
          console.log(`[ProgressSeeder] No exercises found on attempt ${attempt}. Retrying in ${RETRY_DELAY_MS}ms...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        }
      } catch (error) {
        console.error(`[ProgressSeeder] Error fetching exercises on attempt ${attempt}:`, error);
      }
    }

    if (exercises.length === 0) {
      console.log('No exercises found after multiple attempts. Skipping ProgressSeeder.');
      return;
    }

    const progressToSeed: Partial<Progress>[] = [];

    // Crear un registro de progreso inicial para el primer usuario y el primer ejercicio
    const firstUser = users[0];
    const firstExercise = exercises[0];

    if (firstUser && firstExercise) {
        const existingProgress = await progressRepository.findOne({
            where: { user: { id: firstUser.id }, exercise: { id: firstExercise.id } }
        });

        if (!existingProgress) {
            progressToSeed.push({
                user: firstUser,
                exercise: firstExercise,
                score: 0, // Puntuación inicial
                isCompleted: false, // No completado inicialmente
                answers: {
                    attempted: 0,
                    correct: 0,
                    submissionDate: new Date(),
                },
            });
        } else {
            console.log(`Progress record already exists for user "${firstUser.email}" and exercise "${firstExercise.title}". Skipping.`);
        }
    } else {
        console.warn('No user or exercise available to create initial Progress record.');
    }

    // Use a single save call for efficiency
    await progressRepository.save(progressToSeed);

    console.log(`Seeded ${progressToSeed.length} progress records.`);
    console.log('Progress seeder finished.');
  }
}
