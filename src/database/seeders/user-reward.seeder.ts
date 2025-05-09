import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { UserReward, RewardStatus } from '../../features/gamification/entities/user-reward.entity';
import { User } from '../../auth/entities/user.entity'; // Importar la entidad User
import { Reward } from '../../features/reward/entities/reward.entity'; // Importar la entidad Reward

export default class UserRewardSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const userRewardRepository = this.dataSource.getRepository(UserReward);
    const userRepository = this.dataSource.getRepository(User); // Obtener el repositorio de User
    const rewardRepository = this.dataSource.getRepository(Reward); // Obtener el repositorio de Reward

    // Obtener usuarios y recompensas existentes
    const users = await userRepository.find();
    const rewards = await rewardRepository.find();

    console.log(`Found ${users.length} users and ${rewards.length} rewards for UserRewardSeeder.`); // Added log

    if (users.length === 0 || rewards.length === 0) {
        console.log('Skipping UserRewardSeeder: No users or rewards found.');
        return;
    }

    const userRewardsToSeed: Partial<UserReward>[] = [];
    const now = new Date();

    // Create user reward records by iterating through users and assigning a subset of rewards
    for (const user of users) {
        // Select a random subset of rewards for each user
        const shuffledRewards = rewards.sort(() => 0.5 - Math.random());
        // Ensure the number of rewards to assign does not exceed the available rewards
        const maxRewardsToAssign = user.role === 'admin' ? 30 : user.role === 'teacher' ? 20 : 15;
        const numberOfRewardsToAssign = Math.floor(Math.random() * Math.min(shuffledRewards.length, maxRewardsToAssign)) + 1; // Assign more rewards to active roles

        // Only attempt to assign rewards if there are rewards available
        if (shuffledRewards.length > 0) {
            for (let i = 0; i < numberOfRewardsToAssign; i++) {
                const reward = shuffledRewards[i];

                // Añadir logging para verificar IDs
                console.log(`Associating User ID: ${user.id} with Reward ID: ${reward.id}`);

                // Simulate reward status and dates
                const status = Math.random();
                let rewardStatus: RewardStatus;
                let dateAwarded = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000); // Awarded in the last year
                let expiresAt = reward.expirationDays ? new Date(dateAwarded.getTime() + reward.expirationDays * 24 * 60 * 60 * 1000) : null;
                let consumedAt = null;

                if (status < 0.6) { // 60% chance of being Active
                    rewardStatus = RewardStatus.ACTIVE;
                    // Ensure expiresAt is in the future if active and has expiration
                    if (expiresAt && expiresAt < now) {
                        expiresAt = new Date(now.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000); // Extend expiration
                    }
                } else if (status < 0.9) { // 30% chance of being Consumed
                    rewardStatus = RewardStatus.CONSUMED;
                    consumedAt = new Date(dateAwarded.getTime() + Math.random() * (now.getTime() - dateAwarded.getTime())); // Consumed after awarded and before now
                } else { // 10% chance of being Expired
                    rewardStatus = RewardStatus.EXPIRED;
                    // Ensure expiresAt is in the past if expired and has expiration
                     if (expiresAt && expiresAt > now) {
                        expiresAt = new Date(dateAwarded.getTime() + Math.random() * (now.getTime() - dateAwarded.getTime())); // Set expiration in the past
                     } else if (!expiresAt) {
                         // If no expiration days, simulate expiration by setting expiresAt in the past
                         expiresAt = new Date(dateAwarded.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000); // Simulate an expiration date in the past
                     }
                }

                // Simulate metadata based on reward type
                let metadata: any = {};
                switch (reward.type) {
                    case 'points':
                        metadata = { pointsEarned: reward.rewardValue.value };
                        break;
                    case 'badge':
                        metadata = { badgeId: reward.rewardValue.value, badgeName: reward.name }; // Use reward.name for badge name
                        break;
                    case 'achievement':
                        metadata = { achievementId: reward.rewardValue.value, achievementName: reward.name }; // Use reward.name for achievement name
                        break;
                    case 'discount':
                        metadata = { discountPercentage: reward.rewardValue.value, usageCount: rewardStatus === RewardStatus.CONSUMED ? Math.floor(Math.random() * 3) + 1 : 0 }; // Simulate usage count for consumed discounts
                        break;
                    case 'exclusive_content':
                    case 'content':
                        metadata = { contentId: reward.rewardValue.value, unlockedAt: consumedAt }; // Unlocked when consumed
                        break;
                    case 'customization':
                        metadata = { customizationType: reward.rewardValue.value.customizationType, customizationValue: reward.rewardValue.value.customizationValue, appliedAt: consumedAt }; // Applied when consumed
                        break;
                    case 'cultural':
                        metadata = { eventDetails: reward.rewardValue.value, participationDate: consumedAt }; // Participation date when consumed
                        break;
                    case 'experience':
                        metadata = { multiplier: reward.rewardValue.value.multiplier, durationHours: reward.rewardValue.value.durationHours, activatedAt: consumedAt }; // Activated when consumed
                        break;
                }

                userRewardsToSeed.push({
                userId: user.id, // Associate the User ID
                rewardId: reward.id, // Associate the Reward ID
                status: rewardStatus,
                dateAwarded: dateAwarded,
                    expiresAt: expiresAt,
                    consumedAt: consumedAt,
                    metadata: metadata,
                    createdAt: dateAwarded, // Use dateAwarded as creation date
                });
            }
        }
    }

    // Use a single save call for efficiency
    await userRewardRepository.save(userRewardsToSeed);
    console.log(`Seeded ${userRewardsToSeed.length} user reward records.`);
    console.log('UserReward seeder finished.');
  }
}
