import { v4 as uuidv4 } from 'uuid';
import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { Leaderboard } from '../../features/gamification/entities/leaderboard.entity';
import { LeaderboardType, LeaderboardCategory } from '../../features/gamification/enums/leaderboard.enum';
import { User } from '../../auth/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

export class LeaderboardSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const leaderboardRepository = this.dataSource.getRepository(Leaderboard);
    const userRepository = this.dataSource.getRepository(User);

    const leaderboardsJsonPath = path.resolve(__dirname, '../files/json/leaderboards.json');
    const leaderboardsJsonContent = JSON.parse(fs.readFileSync(leaderboardsJsonPath, 'utf-8'));

    const leaderboardsToInsert: Leaderboard[] = [];

    for (const leaderboardData of leaderboardsJsonContent) {
      // Convert date strings to Date objects
      const startDate = new Date(leaderboardData.startDate);
      const endDate = new Date(leaderboardData.endDate);

      // Fetch users for rankings
      const rankingsWithUserIds = [];
      for (const ranking of leaderboardData.rankings) {
        const user = await userRepository.findOne({ where: { email: ranking.userEmail } });
        if (user) {
          rankingsWithUserIds.push({
            userId: user.id,
            name: ranking.name, // Keep name from JSON or use user.username/name
            score: ranking.score,
            achievements: ranking.achievements,
            rank: ranking.rank,
            change: ranking.change,
          });
        } else {
          console.warn(`User with email "${ranking.userEmail}" not found for leaderboard ranking. Skipping.`);
        }
      }

      // Verify if leaderboard already exists
      const existingLeaderboard = await leaderboardRepository.findOne({
        where: {
          type: leaderboardData.type as LeaderboardType,
          category: leaderboardData.category as LeaderboardCategory,
          startDate: startDate,
          endDate: endDate,
        },
      });

      if (!existingLeaderboard) {
        leaderboardsToInsert.push(
          leaderboardRepository.create({
            id: uuidv4(),
            type: leaderboardData.type as LeaderboardType,
            category: leaderboardData.category as LeaderboardCategory,
            startDate: startDate,
            endDate: endDate,
            rankings: rankingsWithUserIds,
            rewards: leaderboardData.rewards,
          }),
        );
      } else {
        console.log(`Leaderboard "${existingLeaderboard.type} - ${existingLeaderboard.category}" for dates ${existingLeaderboard.startDate.toISOString()} to ${existingLeaderboard.endDate.toISOString()} already exists. Skipping.`);
      }
    }

    await leaderboardRepository.save(leaderboardsToInsert);
    console.log(`Seeded ${leaderboardsToInsert.length} new leaderboards.`);
    console.log('Leaderboard seeder finished.');
  }
}
