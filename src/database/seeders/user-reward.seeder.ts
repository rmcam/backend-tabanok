import { DataSource } from "typeorm";
import { User } from "../../auth/entities/user.entity";
import {
  RewardStatus,
  UserReward,
} from "../../features/gamification/entities/user-reward.entity";
import { Reward } from "../../features/reward/entities/reward.entity";
import { DataSourceAwareSeed } from "./index";
import { RewardType } from "../../common/enums/reward.enum"; // Importar RewardType

export default class UserRewardSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const userRewardRepository = this.dataSource.getRepository(UserReward);
    const userRepository = this.dataSource.getRepository(User);
    const rewardRepository = this.dataSource.getRepository(Reward);

    // Truncar la tabla user_rewards para evitar inconsistencias de IDs
    await this.dataSource.query(
      'TRUNCATE TABLE "user_rewards" RESTART IDENTITY CASCADE;'
    );
    console.log("Truncated table: user_rewards");

    // Obtener usuarios y recompensas existentes por nombre
    const users = await userRepository.find();
    const rewards = await rewardRepository.find(); // Obtener todas las recompensas existentes

    console.log(
      `Found ${users.length} users and ${rewards.length} rewards for UserRewardSeeder.`
    );

    if (users.length === 0 || rewards.length === 0) {
      console.log("Skipping UserRewardSeeder: No users or rewards found.");
      return;
    }

    const userRewardsToSeed: Partial<UserReward>[] = [];
    const now = new Date();

    // Mapear recompensas por nombre para fácil acceso
    const rewardsByName: { [key: string]: Reward } = {};
    rewards.forEach(reward => {
        rewardsByName[reward.name] = reward;
    });

    // Log the fetched rewards by name and their IDs
    console.log('Fetched rewards by name in UserRewardSeeder:');
    for (const name in rewardsByName) {
        console.log(`  Name: ${name}, ID: ${rewardsByName[name].id}`);
    }


    // Define the reward names to be used for seeding
    const rewardNamesToUse = [
        'Puntos por Lección',
        'Puntos por Ejercicio',
        'Bonificación Diaria',
        'Puntos por Contribución',
        'Medalla: Aprendiz de Bronce',
        'Medalla: Explorador de Unidades',
        'Medalla: Colaborador Activo',
        'Logro: Maestro del Alfabeto',
        'Logro: Experto en Vocabulario',
        'Logro: Nivel de Fluidez Avanzado',
        'Descuento 10%',
        'Descuento 25%',
        'Contenido Exclusivo: Mitos',
        'Título Personalizado: Explorador',
        'Acceso a Taller Cultural',
        'Multiplicador de Experiencia',
        'Guía de Pronunciación',
        'Bonificación de Verano',
    ];


    // Create user reward records by iterating through users and assigning a subset of rewards
    for (const user of users) {
      // Select a random subset of rewards for each user from the defined names
      const shuffledRewardNames = rewardNamesToUse.sort(() => 0.5 - Math.random());
      const maxRewardsToAssign =
        user.role === "admin" ? 30 : user.role === "teacher" ? 20 : 15;
      const numberOfRewardsToAssign =
        Math.floor(
          Math.random() * Math.min(shuffledRewardNames.length, maxRewardsToAssign)
        ) + 1; // Assign more rewards to active roles

      // Only attempt to assign rewards if there are reward names to use
      if (shuffledRewardNames.length > 0) {
        for (let i = 0; i < numberOfRewardsToAssign; i++) {
          const rewardName = shuffledRewardNames[i];
          const selectedReward = rewardsByName[rewardName];

          // Verificar que la recompensa fue encontrada por nombre
          if (!selectedReward) {
              console.warn(`Reward with name "${rewardName}" not found. Skipping for user ID ${user.id}.`);
              continue;
          }

          // Verificar que rewardValue y reward.rewardValue.value existan antes de usarlo
          if (
            !selectedReward.rewardValue ||
            selectedReward.rewardValue.value === undefined
          ) {
            console.warn(
              `Skipping reward "${selectedReward.name}" for user ID ${user.id}: rewardValue is missing or invalid.`
            );
            continue;
          }

          // Simulate reward status and dates
          const status = Math.random();
          let rewardStatus: RewardStatus;
          let dateAwarded = new Date(
            now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000
          ); // Awarded in the last year
          let expiresAt = selectedReward.expirationDays
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

          // Simulate metadata based on reward type
          let metadata: any = {};
          switch (selectedReward.type) {
            case RewardType.POINTS:
              metadata = { pointsEarned: selectedReward.rewardValue.value };
              break;
            case RewardType.BADGE:
              metadata = {
                badgeId: selectedReward.rewardValue.value,
                badgeName: selectedReward.name,
              }; // Use reward.name for badge name
              break;
            case RewardType.ACHIEVEMENT:
              metadata = {
                achievementId: selectedReward.rewardValue.value,
                achievementName: selectedReward.name,
              }; // Use reward.name for achievement name
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

          userRewardsToSeed.push({
            userId: user.id, // Associate the User ID
            rewardId: selectedReward.id, // Associate the Reward ID
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
    console.log(`Preparing to seed ${userRewardsToSeed.length} user reward records.`);
    console.log('First 5 user reward entries to seed:');
    userRewardsToSeed.slice(0, 5).forEach((entry, index) => {
      console.log(`  Entry ${index}: userId=${entry.userId}, rewardId=${entry.rewardId}, status=${entry.status}`);
    });


    // Use a single save call for efficiency
    await userRewardRepository.save(userRewardsToSeed);
    console.log(`Seeded ${userRewardsToSeed.length} user reward records.`);
    console.log("UserReward seeder finished.");
  }
}
