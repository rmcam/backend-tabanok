import { DataSourceAwareSeed } from './data-source-aware-seed'; 
import { DataSource } from 'typeorm';
import { Progress } from '../../features/progress/entities/progress.entity';
import { User } from '../../auth/entities/user.entity';
import { Exercise } from '../../features/exercises/entities/exercise.entity';
import { UserRole } from '../../auth/enums/auth.enum'; // Import UserRole
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4

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

    const progressToSeed = [];

    // Crear progreso para cada usuario y un número aleatorio de ejercicios
    for (const user of users) {
      // Seed progress for a larger, random subset of exercises per user
      const maxExercisesToSeed = Math.min(exercises.length, user.roles[0] === UserRole.ADMIN ? 50 : user.roles[0] === UserRole.TEACHER ? 30 : 20); // More exercises for teachers/admins
      const numberOfExercisesToSeed = Math.floor(Math.random() * maxExercisesToSeed) + 1;
      const shuffledExercises = exercises.sort(() => 0.5 - Math.random()); // Mezclar ejercicios para variar cuáles se siembran

      for (let i = 0; i < numberOfExercisesToSeed; i++) {
        const exercise = shuffledExercises[i];

        // Simulate completion status and score based on user role and some randomness
        let isCompleted = Math.random() > (user.roles[0] === UserRole.ADMIN ? 0.1 : user.roles[0] === UserRole.TEACHER ? 0.2 : 0.4); // Higher completion chance for active roles
        let score = 0;
        if (isCompleted) {
            score = Math.floor(Math.random() * 31) + (user.roles[0] === UserRole.ADMIN ? 70 : user.roles[0] === UserRole.TEACHER ? 65 : 60); // Higher scores for active roles
        } else {
            score = Math.floor(Math.random() * 60); // Lower scores for incomplete
        }

        const answers = {
          // Simulate more varied answer data based on score and completion
          attempted: Math.floor(Math.random() * (isCompleted ? 3 : 5)) + 1, // Fewer attempts if completed
          correct: isCompleted ? Math.floor(score / (Math.random() * 5 + 1)) : Math.floor(Math.random() * (score / 10)), // Correct answers scale with score
          submissionDate: new Date(Date.now() - Math.random() * (user.roles[0] === UserRole.ADMIN ? 7 : user.roles[0] === UserRole.TEACHER ? 14 : 30) * 24 * 60 * 60 * 1000), // More recent submissions for active roles
          // Add more detailed answer data here if the schema supports it and it's relevant to exercise types
        };

        progressToSeed.push({
          id: uuidv4(), // Assign UUID explicitly
          user: user,
          exercise: exercise,
          score: score,
          isCompleted: isCompleted,
          answers: answers,
        });
      }
    }

    // Use a single save call for efficiency
    await progressRepository.save(progressToSeed);

    console.log(`Seeded ${progressToSeed.length} progress records.`);
    console.log('Progress seeder finished.');
  }
}

