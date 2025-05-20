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
    const progressRepository = this.dataSource.getRepository(Progress);

    // Clear existing progress to prevent conflicts
    console.log('[ProgressSeeder] Clearing existing progress...');
    await this.dataSource.createQueryRunner().query('TRUNCATE TABLE "progress" CASCADE');
    console.log('[ProgressSeeder] Existing progress cleared.');

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
      // Seed progress for a larger, random subset of exercises per user
      const maxExercisesToSeed = Math.min(exercises.length, user.role === UserRole.ADMIN ? 50 : user.role === UserRole.TEACHER ? 30 : 20); // More exercises for teachers/admins
      const numberOfExercisesToSeed = Math.floor(Math.random() * maxExercisesToSeed) + 1;
      const shuffledExercises = exercises.sort(() => 0.5 - Math.random()); // Mezclar ejercicios para variar cuáles se siembran

      for (let i = 0; i < numberOfExercisesToSeed; i++) {
        const exercise = shuffledExercises[i];

        // Simulate completion status and score based on user role and some randomness
        let isCompleted = Math.random() > (user.role === UserRole.ADMIN ? 0.1 : user.role === UserRole.TEACHER ? 0.2 : 0.4); // Higher completion chance for active roles
        let score = 0;
        if (isCompleted) {
            score = Math.floor(Math.random() * 31) + (user.role === UserRole.ADMIN ? 70 : user.role === UserRole.TEACHER ? 65 : 60); // Higher scores for active roles
        } else {
            score = Math.floor(Math.random() * 60); // Lower scores for incomplete
        }

        const answers = {
          // Simulate more varied answer data based on score and completion
          attempted: Math.floor(Math.random() * (isCompleted ? 3 : 5)) + 1, // Fewer attempts if completed
          correct: isCompleted ? Math.floor(score / (Math.random() * 5 + 1)) : Math.floor(Math.random() * (score / 10)), // Correct answers scale with score
          submissionDate: new Date(Date.now() - Math.random() * (user.role === UserRole.ADMIN ? 7 : user.role === UserRole.TEACHER ? 14 : 30) * 24 * 60 * 60 * 1000), // More recent submissions for active roles
          // Add more detailed answer data here if the schema supports it and it's relevant to exercise types
        };

        progressToSeed.push({
          user: user,
          exercise: exercise,
          score: score,
          isCompleted: isCompleted,
          answers: answers,
          createdAt: answers.submissionDate, // Use submission date as creation date
          updatedAt: answers.submissionDate, // Use submission date as update date
        });
      }
    }

    // Use a single save call for efficiency
    await progressRepository.save(progressToSeed);

    console.log(`Seeded ${progressToSeed.length} progress records.`);
    console.log('Progress seeder finished.');
  }
}
