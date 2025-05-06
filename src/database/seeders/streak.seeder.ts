import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { Streak } from '../../features/gamification/entities/streak.entity';

export default class StreakSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(Streak);

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(now.getDate() - 2);

    const streaks = [
      {
        userId: 'fictional-user-id-1', // Asociar a un usuario ficticio por ahora
        currentStreak: 7,
        longestStreak: 10,
        lastActivityDate: yesterday,
        graceDate: null,
        usedGracePeriod: false,
        streakHistory: [
          { date: twoDaysAgo, pointsEarned: 20, bonusMultiplier: 1.1 },
          { date: yesterday, pointsEarned: 30, bonusMultiplier: 1.2 },
        ],
        currentMultiplier: 1.2,
      },
      {
        userId: 'fictional-user-id-2', // Asociar a un usuario ficticio por ahora
        currentStreak: 0,
        longestStreak: 5,
        lastActivityDate: twoDaysAgo,
        graceDate: null,
        usedGracePeriod: false,
        streakHistory: [
          { date: twoDaysAgo, pointsEarned: 15, bonusMultiplier: 1.0 },
        ],
        currentMultiplier: 1.0,
      },
    ];

    const moreStreaks = [
      {
        userId: 'fictional-user-id-3',
        currentStreak: 30,
        longestStreak: 45,
        lastActivityDate: now,
        graceDate: null,
        usedGracePeriod: false,
        streakHistory: [
          { date: twoDaysAgo, pointsEarned: 50, bonusMultiplier: 1.5 },
          { date: yesterday, pointsEarned: 60, bonusMultiplier: 1.6 },
          { date: now, pointsEarned: 70, bonusMultiplier: 1.7 },
        ],
        currentMultiplier: 1.7,
      },
      {
        userId: 'fictional-user-id-4',
        currentStreak: 5,
        longestStreak: 8,
        lastActivityDate: yesterday,
        graceDate: new Date(now.setDate(now.getDate() + 1)), // Gracia hasta mañana
        usedGracePeriod: true,
        streakHistory: [
          { date: twoDaysAgo, pointsEarned: 10, bonusMultiplier: 1.0 },
          { date: yesterday, pointsEarned: 25, bonusMultiplier: 1.1 },
        ],
        currentMultiplier: 1.1,
      },
    ];

    streaks.push(...moreStreaks);

    for (const streakData of streaks) {
      const streak = repository.create(streakData);
      await repository.save(streak);
    }
  }
}
