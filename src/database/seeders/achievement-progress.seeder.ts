import { DataSource } from 'typeorm';
import { AchievementProgress } from '../../features/gamification/entities/achievement-progress.entity';
import { User } from '../../auth/entities/user.entity';
import { Achievement } from '../../features/gamification/entities/achievement.entity';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import * as fs from 'fs';
import * as path from 'path';

export class AchievementProgressSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const achievementProgressRepository = this.dataSource.getRepository(AchievementProgress);
    const userRepository = this.dataSource.getRepository(User);
    const achievementRepository = this.dataSource.getRepository(Achievement);
    const achievementProgressJsonPath = path.resolve(__dirname, '../files/json/achievement_progress.json');

    try {
      const achievementProgressJsonContent = JSON.parse(fs.readFileSync(achievementProgressJsonPath, 'utf-8'));

      for (const progressData of achievementProgressJsonContent) {
        const user = await userRepository.findOne({ where: { email: progressData.userEmail } });

        if (!user) {
          console.log(`User with email ${progressData.userEmail} not found. Skipping achievement progress creation.`);
          continue;
        }

        const achievement = await achievementRepository.findOne({ where: { name: progressData.achievementTitle } });

        if (!achievement) {
          console.log(`Achievement with title "${progressData.achievementTitle}" not found. Skipping achievement progress creation.`);
          continue;
        }

        const existingProgress = await achievementProgressRepository.findOne({
          where: {
            user: { id: user.id },
            achievement: { id: achievement.id },
          },
        });

        if (!existingProgress) {
          const newProgress = achievementProgressRepository.create({
            user: user,
            achievement: achievement,
            progress: progressData.progress,
            percentageCompleted: progressData.percentageCompleted,
            isCompleted: progressData.isCompleted,
            completedAt: progressData.completedAt ? new Date(progressData.completedAt) : null,
            milestones: progressData.milestones,
            rewardsCollected: progressData.rewardsCollected,
            createdAt: progressData.createdAt ? new Date(progressData.createdAt) : new Date(),
            updatedAt: progressData.updatedAt ? new Date(progressData.updatedAt) : new Date(),
          });
          await achievementProgressRepository.save(newProgress);
          console.log(`Achievement progress for user "${user.email}" and achievement "${achievement.name}" seeded.`);
        } else {
          console.log(`Achievement progress for user "${user.email}" and achievement "${achievement.name}" already exists. Skipping.`);
        }
      }
      console.log('AchievementProgress seeder finished.');
    } catch (error) {
      console.error('Error seeding achievement progress:', error);
    }
  }
}
