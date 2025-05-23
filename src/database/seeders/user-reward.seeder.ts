import { Achievement, Badge } from "@/features/gamification/entities";
import { DataSource } from "typeorm";
import { User } from "../../auth/entities/user.entity";
import { RewardTrigger, RewardType } from "../../common/enums/reward.enum"; // Importar RewardType y RewardTrigger
import {
  RewardStatus,
  UserReward,
} from "../../features/gamification/entities/user-reward.entity";
import { Reward } from "../../features/reward/entities/reward.entity";
import { DataSourceAwareSeed } from "./data-source-aware-seed";


export class UserRewardSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const userRewardRepository = this.dataSource.getRepository(UserReward);
    const userRepository = this.dataSource.getRepository(User);
    const rewardRepository = this.dataSource.getRepository(Reward);

    // Obtener usuarios existentes
    const users = await userRepository.find();

    console.log(`Found ${users.length} users for UserRewardSeeder.`);

    if (users.length === 0) {
      console.log("Skipping UserRewardSeeder: No users found.");
      return;
    }

    const userRewardsToSeed: Partial<UserReward>[] = [];
    const now = new Date();

    // Create user reward records by iterating through users and assigning a subset of available rewards
    for (const user of users) {
    // Obtener todas las recompensas disponibles para este usuario (se consulta en cada iteración)
    const availableRewards = await rewardRepository.find();

    // Agregar un pequeño retraso para probar la sincronización transaccional
    await new Promise(resolve => setTimeout(resolve, 100));

    // Select a random subset of available rewards for each user
    const shuffledRewards = availableRewards.sort(
      () => 0.5 - Math.random()
    );
    const maxRewardsToAssign =
      user.roles[0] === "admin" ? 30 : user.roles[0] === "teacher" ? 20 : 15;
    const numberOfRewardsToAssign =
      Math.floor(
        Math.random() *
          Math.min(shuffledRewards.length, maxRewardsToAssign)
      ) + 1; // Assign more rewards to active roles

    // Only attempt to assign rewards if there are available rewards
    if (shuffledRewards.length > 0) {
      // Filter rewards to only include those with a valid rewardValue.value
      const validRewards = shuffledRewards.filter(reward => reward.rewardValue && reward.rewardValue.value !== undefined && reward.rewardValue.value !== null);

      // Adjust the number of rewards to assign based on the number of valid rewards
      const numberOfValidRewardsToAssign = Math.floor(Math.random() * Math.min(validRewards.length, maxRewardsToAssign)) + 1;

      for (let i = 0; i < numberOfValidRewardsToAssign; i++) {
        const selectedReward = validRewards[i]; // Use validRewards

        // Simulate reward status and dates
        const status = Math.random();
        let rewardStatus: RewardStatus;
        let dateAwarded = new Date(
          now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000
        ); // Awarded in the last year
        let expiresAt = selectedReward.expirationDays // Use selectedReward
          ? new Date(
              dateAwarded.getTime() +
                selectedReward.expirationDays * 24 * 60 * 60 * 1000
            )
          : null;
        let consumedAt = null;

          if (status < 0.6) {
            // 60% chance of being Active
            rewardStatus = RewardStatus.ACTIVE;
            // Ensure expiresAt is in the future if active and has expiration
            if (expiresAt && expiresAt < now) {
              expiresAt = new Date(
                now.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000
              ); // Extend expiration
            }
          } else if (status < 0.9) {
            // 30% chance of being Consumed
            rewardStatus = RewardStatus.CONSUMED;
            consumedAt = new Date(
              dateAwarded.getTime() +
                Math.random() * (now.getTime() - dateAwarded.getTime())
            ); // Consumed after awarded and before now
          } else {
            // 10% chance of being Expired
            rewardStatus = RewardStatus.EXPIRED;
            // Ensure expiresAt is in the past if expired and has expiration
            if (expiresAt && expiresAt > now) {
              expiresAt = new Date(
                dateAwarded.getTime() +
                  Math.random() * (now.getTime() - dateAwarded.getTime())
              ); // Set expiration in the past
            } else if (!expiresAt) {
              // If no expiration days, simulate expiration by setting expiresAt in the past
              expiresAt = new Date(
                dateAwarded.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000
              ); // Simulate an expiration date in the past
            }
          }

          // Simulate metadata based on reward type using the selected reward object
          let metadata: any = {};
          if (selectedReward.rewardValue) { // Use selectedReward
            switch (selectedReward.type) { // Use selectedReward
              case RewardType.POINTS:
                metadata = { pointsEarned: selectedReward.rewardValue.value };
                break;
              case RewardType.BADGE:
                metadata = {
                  badgeId: selectedReward.rewardValue.value,
                  badgeName: selectedReward.name.replace('Medalla: ', ''), // Assuming name format "Medalla: [Badge Name]"
                };
                break;
              case RewardType.ACHIEVEMENT:
                 metadata = {
                  achievementId: selectedReward.rewardValue.value,
                  achievementName: selectedReward.name.replace('Logro: ', ''), // Assuming name format "Logro: [Achievement Name]"
                };
                break;
              case RewardType.DISCOUNT:
                metadata = {
                  discountPercentage: selectedReward.rewardValue.value,
                  usageCount:
                    rewardStatus === RewardStatus.CONSUMED
                      ? Math.floor(Math.random() * 3) + 1
                      : 0,
                }; // Simulate usage count for consumed discounts
                break;
              case RewardType.EXCLUSIVE_CONTENT:
              case RewardType.CONTENT:
                metadata = {
                  contentId: selectedReward.rewardValue.value,
                  unlockedAt: consumedAt,
                }; // Unlocked when consumed
                break;
              case RewardType.CUSTOMIZATION:
                metadata = {
                  customizationType:
                    selectedReward.rewardValue.value.customizationType,
                  customizationValue:
                    selectedReward.rewardValue.value.customizationValue,
                  appliedAt: consumedAt,
                }; // Applied when consumed
                break;
              case RewardType.CULTURAL:
                metadata = {
                  eventDetails: selectedReward.rewardValue.value,
                  participationDate: consumedAt,
                }; // Participation date when consumed
                break;
              case RewardType.EXPERIENCE:
                metadata = {
                  multiplier: selectedReward.rewardValue.value.multiplier,
                  durationHours: selectedReward.rewardValue.value.durationHours,
                  activatedAt: consumedAt,
                }; // Activated when consumed
                break;
            }
          } else {
             console.warn(
              `Skipping metadata for reward "${selectedReward.name}" (ID: ${selectedReward.id}): rewardValue is missing.`
            );
          }


          userRewardsToSeed.push({
            userId: user.id, // Associate the User ID
            rewardId: selectedReward.id, // Always use the Reward entity's ID
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


    // Log the number of records to seed and the first few entries for inspection
    console.log(
      `Preparing to seed ${userRewardsToSeed.length} user reward records.`
    );
    console.log("First 5 user reward entries to seed:");
    userRewardsToSeed.slice(0, 5).forEach((entry, index) => {
      console.log(
        `  Entry ${index}: userId=${entry.userId}, rewardId=${entry.rewardId}, status=${entry.status}`
      );
    });

    // Log the user rewards to seed before saving
    console.log("User rewards to seed:", userRewardsToSeed);

    // Refetch rewards right before saving to ensure they exist in the current transaction state
    const currentRewardsInDb = await rewardRepository.find();
    const currentRewardIds = new Set(currentRewardsInDb.map(r => r.id));

    // Filter userRewardsToSeed to only include those with rewardIds present in the database
    const finalUserRewardsToSeed = userRewardsToSeed.filter(ur => currentRewardIds.has(ur.rewardId));

    // Use a single save call for efficiency
    await userRewardRepository.save(finalUserRewardsToSeed);
    console.log(`Seeded ${finalUserRewardsToSeed.length} user reward records.`); // Log the actual number seeded
    console.log("UserReward seeder finished.");
  }
}
