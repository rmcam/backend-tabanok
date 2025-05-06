import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { AchievementProgress } from '../../features/gamification/entities/achievement-progress.entity';
import { User } from '../../auth/entities/user.entity';
import { CulturalAchievement } from '../../features/gamification/entities/cultural-achievement.entity';

export class AchievementProgressSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const achievementProgressRepository = this.dataSource.getRepository(AchievementProgress);
    const userRepository = this.dataSource.getRepository(User);
    const culturalAchievementRepository = this.dataSource.getRepository(CulturalAchievement);

    // Obtener más usuarios y logros culturales existentes
    const users = await userRepository.find({ take: 10 }); // Obtener los primeros 10 usuarios
    const culturalAchievements = await culturalAchievementRepository.find({ take: 5 }); // Obtener los primeros 5 logros culturales

    const achievementProgressToSeed = [];

    // Crear progreso para una variedad de usuarios y logros culturales
    if (users.length > 0 && culturalAchievements.length > 0) {
      for (const user of users) {
        for (const achievement of culturalAchievements) {
          const isCompleted = Math.random() > 0.5; // 50% de probabilidad de estar completado
          const percentageCompleted = isCompleted ? 100 : Math.floor(Math.random() * 99);
          const completedAt = isCompleted ? new Date() : null;

          const progressData = [
            { requirementType: 'categories_completed', currentValue: Math.floor(percentageCompleted / 33), targetValue: 3, lastUpdated: new Date() },
            { requirementType: 'lessons_in_category_completed', currentValue: Math.floor(percentageCompleted / 10), targetValue: 10, lastUpdated: new Date() },
          ];

          const milestonesData = isCompleted ? null : [
            { description: 'Completa 1 categoría', value: 1, isAchieved: percentageCompleted >= 33, achievedAt: percentageCompleted >= 33 ? new Date() : null },
            { description: 'Completa 2 categorías', value: 2, isAchieved: percentageCompleted >= 66, achievedAt: percentageCompleted >= 66 ? new Date() : null },
            { description: 'Completa 3 categorías', value: 3, isAchieved: false },
          ];

          const rewardsCollectedData = isCompleted ? [{ type: 'points', value: 250, collectedAt: new Date() }] : [];

          achievementProgressToSeed.push(
            achievementProgressRepository.create({
              user: user,
              achievement: achievement,
              progress: progressData,
              percentageCompleted: percentageCompleted,
              isCompleted: isCompleted,
              completedAt: completedAt,
              milestones: milestonesData,
              rewardsCollected: rewardsCollectedData,
            })
          );
        }
      }
    }

    // Eliminar progreso de logros existente para evitar duplicados
    await achievementProgressRepository.clear();

    await achievementProgressRepository.save(achievementProgressToSeed);

    console.log('AchievementProgress seeder finished.');
  }
}
