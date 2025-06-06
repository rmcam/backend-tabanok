import { DataSource } from 'typeorm';

import { AchievementProgress } from '../../features/gamification/entities/achievement-progress.entity';
import { User } from '../../auth/entities/user.entity';
import { CulturalAchievement } from '../../features/gamification/entities/cultural-achievement.entity'; // Import CulturalAchievement entity
import { DataSourceAwareSeed } from './data-source-aware-seed';

export class AchievementProgressSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const achievementProgressRepository = this.dataSource.getRepository(AchievementProgress);
    const userRepository = this.dataSource.getRepository(User);
    const culturalAchievementRepository = this.dataSource.getRepository(CulturalAchievement); // Use CulturalAchievement repository

    // Clear existing progress to prevent conflicts
    console.log('[AchievementProgressSeeder] Clearing existing achievement progress...');
    await achievementProgressRepository.clear(); // Eliminar todos los registros existentes
    console.log('[AchievementProgressSeeder] Existing achievement progress cleared.');

    const users = await userRepository.find();
    const culturalAchievements = await culturalAchievementRepository.find();

    if (users.length === 0 || culturalAchievements.length === 0) {
      console.log('Skipping AchievementProgressSeeder: No users or cultural achievements found.');
      return;
    }

    const achievementProgressToSeed: Partial<AchievementProgress>[] = [];

    // Crear un registro de progreso inicial para cada combinación de usuario y logro cultural
    for (const user of users) {
        for (const culturalAchievement of culturalAchievements) {
            const existingProgress = await achievementProgressRepository.findOne({
                where: { user: { id: user.id }, achievement: { id: culturalAchievement.id } }
            });

            if (!existingProgress) {
                // Valores iniciales para el progreso (no completado)
                const initialProgressData = [{
                    requirementType: culturalAchievement.type || 'generic_progress',
                    currentValue: 0,
                    targetValue: culturalAchievement.requirements && culturalAchievement.requirements.length > 0
                        ? culturalAchievement.requirements[0].value
                        : 1, // Valor por defecto si no hay requisitos
                    lastUpdated: new Date(),
                }];

                const newAchievementProgress = achievementProgressRepository.create({
                    user: user,
                    achievement: culturalAchievement,
                    progress: initialProgressData,
                    percentageCompleted: 0,
                    isCompleted: false,
                    completedAt: null,
                    milestones: [],
                    rewardsCollected: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                await achievementProgressRepository.save(newAchievementProgress); // Insertar individualmente

            } else {
                console.log(`AchievementProgress already exists for user "${user.email}" and achievement "${culturalAchievement.name}". Skipping.`);
            }
        }
    }

    // Use a single insert call for efficiency
    // await achievementProgressRepository.upsert(achievementProgressToSeed as any, ['user', 'achievement']); // Eliminar upsert masivo

    console.log('AchievementProgress seeder finished.'); // Ajustar mensaje final
  }
}
