import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { UserAchievement, AchievementStatus } from '../../features/gamification/entities/user-achievement.entity';

export default class UserAchievementSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(UserAchievement);

    const now = new Date();
    const pastDate = new Date(now);
    pastDate.setDate(now.getDate() - 15);

    const userAchievements: Partial<UserAchievement>[] = [
      {
        userId: 'fictional-user-id-1', // Asociar a un usuario ficticio por ahora
        achievementId: 'fictional-achievement-id-1', // Asociar a un logro ficticio por ahora
        achievementType: 'GENERAL',
        status: AchievementStatus.COMPLETED,
        progress: { current: 1, total: 1 },
        completedAt: now,
        dateAwarded: pastDate,
      },
      {
        userId: 'fictional-user-id-1', // Asociar a un usuario ficticio por ahora
        achievementId: 'fictional-achievement-id-2', // Asociar a un logro ficticio por ahora
        achievementType: 'GENERAL',
        status: AchievementStatus.IN_PROGRESS,
        progress: { current: 3, total: 5 },
        completedAt: null,
        dateAwarded: pastDate,
      },
      {
        userId: 'fictional-user-id-2', // Asociar a un usuario ficticio por ahora
        achievementId: 'fictional-achievement-id-3', // Asociar a un logro ficticio por ahora
        achievementType: 'CULTURAL',
        status: AchievementStatus.COMPLETED,
        progress: { current: 1, total: 1 },
        completedAt: now,
        dateAwarded: pastDate,
      },
    ];

    const moreUserAchievements: Partial<UserAchievement>[] = [
      {
        userId: 'fictional-user-id-3',
        achievementId: 'fictional-achievement-id-4',
        achievementType: 'GENERAL',
        status: AchievementStatus.COMPLETED,
        progress: { current: 1, total: 1 },
        completedAt: now,
        dateAwarded: pastDate,
      },
      {
        userId: 'fictional-user-id-3',
        achievementId: 'fictional-achievement-id-5',
        achievementType: 'GENERAL',
        status: AchievementStatus.IN_PROGRESS,
        progress: { current: 8, total: 10 },
        completedAt: null,
        dateAwarded: pastDate,
      },
      {
        userId: 'fictional-user-id-4',
        achievementId: 'fictional-achievement-id-1',
        achievementType: 'GENERAL',
        status: AchievementStatus.COMPLETED,
        progress: { current: 1, total: 1 },
        completedAt: now,
        dateAwarded: pastDate,
      },
      {
        userId: 'fictional-user-id-4',
        achievementId: 'fictional-achievement-id-6',
        achievementType: 'CULTURAL',
        status: AchievementStatus.IN_PROGRESS,
        progress: { current: 1, total: 5 },
        completedAt: null,
        dateAwarded: pastDate,
      },
    ];

    userAchievements.push(...moreUserAchievements);

    for (const userAchievementData of userAchievements) {
      const createdAchievement = repository.create(userAchievementData);
      await repository.save(createdAchievement);
    }
  }
}
