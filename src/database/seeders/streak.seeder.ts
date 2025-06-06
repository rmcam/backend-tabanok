import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed'; 
import { Streak } from '../../features/gamification/entities/streak.entity';
import { User } from '../../auth/entities/user.entity'; // Import User

export class StreakSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const streakRepository = this.dataSource.getRepository(Streak);
    const userRepository = this.dataSource.getRepository(User); // Get User repository

    const users = await userRepository.find(); // Fetch all users

    if (users.length === 0) {
      console.log('No users found. Skipping StreakSeeder.');
      return;
    }

    const streaksToSeed: Partial<Streak>[] = [];
    const now = new Date();

    for (const user of users) {
        const existingStreak = await streakRepository.findOne({ where: { userId: user.id } });

        if (!existingStreak) {
            streaksToSeed.push({
                userId: user.id,
                currentStreak: 0, // Racha inicial a 0
                longestStreak: 0, // Racha más larga a 0
                lastActivityDate: now, // Última actividad ahora
                graceDate: null, // Sin período de gracia
                usedGracePeriod: false, // No usado
                streakHistory: [], // Historial vacío
                currentMultiplier: 1.0, // Multiplicador inicial
            });
        } else {
            console.log(`Streak record already exists for user "${user.email}". Skipping.`);
        }
    }

    // Save all streak records in a single call
    await streakRepository.save(streaksToSeed);
    console.log(`Seeded ${streaksToSeed.length} streak records.`);
    console.log('Streak seeder finished.');
  }
}
