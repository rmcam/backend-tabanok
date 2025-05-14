import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed'; 
import { Streak } from '../../features/gamification/entities/streak.entity';
import { User } from '../../auth/entities/user.entity'; // Import User
import { v4 as uuidv4 } from 'uuid';

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

    const streaksToSeed = [];
    const now = new Date();

    for (const user of users) {
        // Simulate streak data for each user
        const longestStreak = Math.floor(Math.random() * 100); // Longest streak up to 100 days
        const currentStreak = Math.random() > 0.2 ? Math.floor(Math.random() * (longestStreak + 1)) : 0; // 80% chance of having a current streak
        const lastActivityDate = new Date(now.getTime() - (currentStreak > 0 ? 0 : Math.random() * 30) * 24 * 60 * 60 * 1000); // Last activity is today if streak > 0, otherwise in last 30 days

        // Ensure currentStreak is not greater than longestStreak
        const finalCurrentStreak = Math.min(currentStreak, longestStreak);

        // Simulate streak history
        const streakHistory = [];
        let historyEndDate = new Date(lastActivityDate);
        let remainingStreak = finalCurrentStreak;

        while (remainingStreak > 0) {
            const duration = Math.min(remainingStreak, Math.floor(Math.random() * 10) + 1); // Simulate streaks of random duration
            const startDate = new Date(historyEndDate.getTime() - duration * 24 * 60 * 60 * 1000);
            const pointsEarned = duration * (Math.floor(Math.random() * 10) + 10); // Points scale with duration
            const bonusMultiplier = parseFloat((1.0 + duration * 0.1).toFixed(1)); // Multiplier scales with duration

            streakHistory.unshift({ date: startDate, pointsEarned, bonusMultiplier }); // Add to the beginning of history
            historyEndDate = new Date(startDate.getTime() - 1); // Move to the day before the streak started
            remainingStreak -= duration;
        }

        // Add some past broken streaks to history
        const numPastStreaks = Math.floor(Math.random() * 5);
        for (let i = 0; i < numPastStreaks; i++) {
            const duration = Math.floor(Math.random() * 20) + 1;
            const endDate = new Date(lastActivityDate.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000); // Broken streaks in last 180 days
            const startDate = new Date(endDate.getTime() - duration * 24 * 60 * 60 * 1000);
             const pointsEarned = duration * (Math.floor(Math.random() * 10) + 10);
            const bonusMultiplier = parseFloat((1.0 + duration * 0.1).toFixed(1));
            streakHistory.unshift({ date: startDate, pointsEarned, bonusMultiplier });
        }


        const usedGracePeriod = Math.random() > 0.7; // 30% chance of using grace period
        const graceDate = usedGracePeriod ? new Date(lastActivityDate.getTime() + 24 * 60 * 60 * 1000) : null; // Grace period is 24 hours after last activity

        const currentMultiplier = parseFloat((1.0 + finalCurrentStreak * 0.1).toFixed(1)); // Current multiplier based on current streak


        streaksToSeed.push({
          id: uuidv4(),
          userId: user.id,
          currentStreak: finalCurrentStreak,
          longestStreak: longestStreak,
          lastActivityDate: lastActivityDate,
          graceDate: graceDate,
          usedGracePeriod: usedGracePeriod,
          streakHistory: streakHistory,
          currentMultiplier: currentMultiplier,
        });
    }

    // Save all streak records in a single call
    await streakRepository.save(streaksToSeed);
    console.log(`Seeded ${streaksToSeed.length} streak records.`);
    console.log('Streak seeder finished.');
  }
}
