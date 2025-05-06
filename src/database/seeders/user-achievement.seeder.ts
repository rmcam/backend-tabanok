import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { UserAchievement, AchievementStatus } from '../../features/gamification/entities/user-achievement.entity';
import { User } from '../../auth/entities/user.entity';
import { Achievement } from '../../features/gamification/entities/achievement.entity';
import { v4 as uuidv4 } from 'uuid';

export default class UserAchievementSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const userAchievementRepository = this.dataSource.getRepository(UserAchievement);
    const userRepository = this.dataSource.getRepository(User);
    const achievementRepository = this.dataSource.getRepository(Achievement);

    await userAchievementRepository.clear(); // Limpiar la tabla antes de sembrar

    const users = await userRepository.find();
    const achievements = await achievementRepository.find();

    if (users.length === 0 || achievements.length === 0) {
      console.log('Skipping UserAchievementSeeder: No users or achievements found.');
      return;
    }

    const now = new Date();
    const pastDate = new Date(now);
    pastDate.setDate(now.getDate() - 15);

    const userAchievementsToSeed: Partial<UserAchievement>[] = [];

    // Create some user achievements by randomly selecting users and achievements
    for (let i = 0; i < 10; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomAchievement = achievements[Math.floor(Math.random() * achievements.length)];

      userAchievementsToSeed.push({
        userId: randomUser.id,
        achievementId: randomAchievement.id,
        achievementType: randomAchievement.criteria === 'cultural_contribution' ? 'CULTURAL' : 'GENERAL', // Assuming criteria can determine type
        status: Math.random() > 0.5 ? AchievementStatus.COMPLETED : AchievementStatus.IN_PROGRESS,
        progress: { current: Math.floor(Math.random() * (randomAchievement.requirement || 1)) + 1, total: randomAchievement.requirement || 1 },
        completedAt: Math.random() > 0.5 ? now : null,
        dateAwarded: pastDate,
      });
    }


    for (const userAchievementData of userAchievementsToSeed) {
      // Check if a similar entry already exists to avoid duplicates on subsequent runs
      const existingUserAchievement = await userAchievementRepository.findOne({
        where: {
          userId: userAchievementData.userId,
          achievementId: userAchievementData.achievementId,
        },
      });

      if (!existingUserAchievement) {
        const createdAchievement = userAchievementRepository.create(userAchievementData);
        await userAchievementRepository.save(createdAchievement);
        console.log(`User Achievement seeded for User ID: ${userAchievementData.userId} and Achievement ID: ${userAchievementData.achievementId}`);
      } else {
        console.log(`User Achievement for User ID: ${userAchievementData.userId} and Achievement ID: ${userAchievementData.achievementId} already exists. Skipping.`);
      }
    }
  }
}
