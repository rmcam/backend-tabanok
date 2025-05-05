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

    // Obtener algunos usuarios y logros culturales existentes
    const users = await userRepository.find({ take: 5 }); // Obtener los primeros 5 usuarios
    const culturalAchievements = await culturalAchievementRepository.find({ take: 3 }); // Obtener los primeros 3 logros culturales

    const achievementProgressToSeed = [];

    // Crear progreso para algunos usuarios y logros culturales
    if (users.length > 0 && culturalAchievements.length > 0) {
      achievementProgressToSeed.push(
        achievementProgressRepository.create({
          user: users[0], // Asociar al primer usuario
          achievement: culturalAchievements[0], // Asociar al primer logro cultural
          progress: [
            { requirementType: 'categories_completed', currentValue: 2, targetValue: 3, lastUpdated: new Date() },
          ],
          percentageCompleted: (2 / 3) * 100,
          isCompleted: false,
          milestones: [
            { description: 'Completa 1 categoría', value: 1, isAchieved: true, achievedAt: new Date() },
            { description: 'Completa 2 categorías', value: 2, isAchieved: true, achievedAt: new Date() },
            { description: 'Completa 3 categorías', value: 3, isAchieved: false },
          ],
        }),
        achievementProgressRepository.create({
          user: users[1], // Asociar al segundo usuario
          achievement: culturalAchievements[1], // Asociar al segundo logro cultural
          progress: [
            { requirementType: 'lessons_in_category_completed', currentValue: 10, targetValue: 10, lastUpdated: new Date() },
          ],
          percentageCompleted: 100,
          isCompleted: true,
          completedAt: new Date(),
          milestones: null, // Sin hitos específicos para este logro
          rewardsCollected: [{ type: 'points', value: 250, collectedAt: new Date() }],
        }),
        // Agregar más progreso de logros según sea necesario
      );
    }

    // Eliminar progreso de logros existente para evitar duplicados
    await achievementProgressRepository.clear();

    await achievementProgressRepository.save(achievementProgressToSeed);

    console.log('AchievementProgress seeder finished.');
  }
}
