import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { AchievementProgress } from '../../features/gamification/entities/achievement-progress.entity';
import { User } from '../../auth/entities/user.entity';
import { CulturalAchievement } from '../../features/gamification/entities/cultural-achievement.entity'; // Import CulturalAchievement entity

export class AchievementProgressSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const achievementProgressRepository = this.dataSource.getRepository(AchievementProgress);
    const userRepository = this.dataSource.getRepository(User);
    const culturalAchievementRepository = this.dataSource.getRepository(CulturalAchievement); // Use CulturalAchievement repository

    await achievementProgressRepository.clear(); // Limpiar la tabla antes de sembrar

    const users = await userRepository.find(); // Get all users
    const culturalAchievements = await culturalAchievementRepository.find(); // Get all cultural achievements

    if (users.length === 0 || culturalAchievements.length === 0) {
      console.log('Skipping AchievementProgressSeeder: No users or cultural achievements found.');
      return;
    }

    const now = new Date();
    const achievementProgressToSeed: Partial<AchievementProgress>[] = [];

    // Create progress for a subset of users and cultural achievements
    for (const user of users) {
        // Select a random subset of cultural achievements for each user to have progress on
        const shuffledCulturalAchievements = culturalAchievements.sort(() => 0.5 - Math.random());
        const numberOfAchievementsWithProgress = Math.floor(Math.random() * Math.min(shuffledCulturalAchievements.length, user.role === 'admin' ? 30 : user.role === 'teacher' ? 20 : 15)) + 1; // More progress records for active roles

        for (let i = 0; i < numberOfAchievementsWithProgress; i++) {
            const culturalAchievement = shuffledCulturalAchievements[i];

            // Simulate completion status and progress based on randomness and achievement requirement
            const isCompleted = Math.random() > (user.role === 'admin' ? 0.05 : user.role === 'teacher' ? 0.2 : 0.5); // Higher completion chance for active roles
            const percentageCompleted = isCompleted ? 100 : Math.floor(Math.random() * 99);
            const completedAt = isCompleted ? new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null; // Completed in last 30 days if completed

            // Simulate progress data based on achievement criteria and percentage completed
            const progressData: any[] = [];
            // Use the first requirement from the requirements array
            const mainRequirement = culturalAchievement.requirements && culturalAchievement.requirements.length > 0
                ? culturalAchievement.requirements[0]
                : { type: 'generic', value: 1, description: 'Generic requirement' };

            const totalRequirement = mainRequirement.value;

            // Simulate progress data based on achievement type and percentage completed
            progressData.push({
                requirementType: culturalAchievement.type || 'generic_progress', // Use achievement type as requirement type
                currentValue: Math.floor(totalRequirement * (percentageCompleted / 100)),
                targetValue: totalRequirement,
                lastUpdated: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Updated recently
            });

            // Simulate milestones based on percentage completed
            const milestonesData: any[] = [];
            if (percentageCompleted >= 25) milestonesData.push({ description: '25% completado', value: 25, isAchieved: true, achievedAt: new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000) });
            if (percentageCompleted >= 50) milestonesData.push({ description: '50% completado', value: 50, isAchieved: true, achievedAt: new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000) });
            if (percentageCompleted >= 75) milestonesData.push({ description: '75% completado', value: 75, isAchieved: true, achievedAt: new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000) });
            if (percentageCompleted === 100) milestonesData.push({ description: '100% completado', value: 100, isAchieved: true, achievedAt: completedAt });


            // Simulate collected rewards if completed
            const rewardsCollectedData = isCompleted ? [{ type: 'points', value: culturalAchievement.pointsReward || 0, collectedAt: completedAt }] : []; // Collect pointsReward if completed


            achievementProgressToSeed.push(
                achievementProgressRepository.create({
                    user: user,
                    achievement: culturalAchievement,
                    progress: progressData,
                    percentageCompleted: percentageCompleted,
                    isCompleted: isCompleted,
                    completedAt: completedAt,
                    milestones: milestonesData,
                    rewardsCollected: rewardsCollectedData,
                    createdAt: new Date(now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000), // Created in last 180 days
                    updatedAt: completedAt || new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Updated at completion or recently
                })
            );
        }
    }

    // Use a single save call for efficiency
    await achievementProgressRepository.save(achievementProgressToSeed);

    console.log(`Seeded ${achievementProgressToSeed.length} achievement progress records.`);
    console.log('AchievementProgress seeder finished.');
  }
}
