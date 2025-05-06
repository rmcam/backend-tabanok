import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { UserReward, RewardStatus } from '../../features/gamification/entities/user-reward.entity';

export default class UserRewardSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(UserReward);

    const now = new Date();
    const pastDate = new Date(now);
    pastDate.setDate(now.getDate() - 20);
    const futureDate = new Date(now);
    futureDate.setDate(now.getDate() + 10);

    const userRewards: Partial<UserReward>[] = [
      {
        userId: 'fictional-user-id-1', // Asociar a un usuario ficticio por ahora
        rewardId: 'fictional-reward-id-1', // Asociar a una recompensa ficticia por ahora
        status: RewardStatus.ACTIVE,
        dateAwarded: pastDate,
        expiresAt: futureDate,
        metadata: { additionalData: { source: 'mission-completion' } },
      },
      {
        userId: 'fictional-user-id-1', // Asociar a un usuario ficticio por ahora
        rewardId: 'fictional-reward-id-2', // Asociar a una recompensa ficticia por ahora
        status: RewardStatus.CONSUMED,
        dateAwarded: pastDate,
        consumedAt: now,
        metadata: { usageCount: 1 },
      },
      {
        userId: 'fictional-user-id-2', // Asociar a un usuario ficticio por ahora
        rewardId: 'fictional-reward-id-1', // Asociar a una recompensa ficticia por ahora
        status: RewardStatus.ACTIVE,
        dateAwarded: pastDate,
        expiresAt: futureDate,
      },
    ];

    const moreUserRewards: Partial<UserReward>[] = [
      {
        userId: 'fictional-user-id-3',
        rewardId: 'fictional-reward-id-3',
        status: RewardStatus.ACTIVE,
        dateAwarded: pastDate,
        expiresAt: futureDate,
        metadata: { additionalData: { source: 'leaderboard-reward' } },
      },
      {
        userId: 'fictional-user-id-3',
        rewardId: 'fictional-reward-id-4',
        status: RewardStatus.EXPIRED,
        dateAwarded: pastDate,
        expiresAt: new Date(now.setDate(now.getDate() - 1)), // Expirada ayer
        metadata: {},
      },
      {
        userId: 'fictional-user-id-4',
        rewardId: 'fictional-reward-id-1',
        status: RewardStatus.ACTIVE,
        dateAwarded: pastDate,
        expiresAt: futureDate,
        metadata: { additionalData: { source: 'mission-completion' } },
      },
      {
        userId: 'fictional-user-id-4',
        rewardId: 'fictional-reward-id-2',
        status: RewardStatus.CONSUMED,
        dateAwarded: pastDate,
        consumedAt: now,
        metadata: { usageCount: 1 },
      },
    ];

    userRewards.push(...moreUserRewards);

    for (const userRewardData of userRewards) {
      const userReward = repository.create(userRewardData);
      await repository.save(userReward);
    }
  }
}
