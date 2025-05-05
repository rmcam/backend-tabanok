import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { CulturalAchievement, AchievementCategory, AchievementType, AchievementTier } from '../../features/gamification/entities/cultural-achievement.entity'; // Importar entidad y enums

export class CulturalAchievementSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const culturalAchievementRepository = this.dataSource.getRepository(CulturalAchievement);

    const culturalAchievementsToSeed = [
      {
        name: 'Explorador Cultural',
        description: 'Completa lecciones en 3 categorías culturales diferentes.',
        iconUrl: 'http://example.com/icons/cultural_explorer.png',
        category: AchievementCategory.TRADICION,
        type: AchievementType.APRENDIZAJE_LENGUA, // Ajustado a un tipo más general si aplica
        tier: AchievementTier.BRONCE,
        requirements: [{ type: 'categories_completed', value: 3, description: 'Completar 3 categorías' }],
        pointsReward: 100,
        isActive: true,
        isSecret: false,
      },
      {
        name: 'Guardián de la Historia',
        description: 'Completa todas las lecciones de historia.',
        iconUrl: 'http://example.com/icons/history_guardian.png',
        category: AchievementCategory.HISTORIA,
        type: AchievementType.APRENDIZAJE_LENGUA, // Ajustado
        tier: AchievementTier.PLATA,
        requirements: [{ type: 'lessons_in_category_completed', value: 10, description: 'Completar 10 lecciones de historia' }],
        pointsReward: 250,
        isActive: true,
        isSecret: false,
      },
      {
        name: 'Maestro Artesano',
        description: 'Completa todos los ejercicios de artesanía con un 90% de precisión.',
        iconUrl: 'http://example.com/icons/craft_master.png',
        category: AchievementCategory.ARTESANIA,
        type: AchievementType.DOMINIO_CULTURAL,
        tier: AchievementTier.ORO,
        requirements: [
          { type: 'exercises_in_category_completed', value: 15, description: 'Completar 15 ejercicios de artesanía' },
          { type: 'average_score_in_category', value: 90, description: 'Promedio del 90% en artesanía' },
        ],
        pointsReward: 500,
        isActive: true,
        isSecret: false,
      },
      // Agregar más logros culturales según sea necesario
    ];

    // Eliminar logros culturales existentes para evitar duplicados
    await culturalAchievementRepository.clear();

    await culturalAchievementRepository.save(culturalAchievementsToSeed);

    console.log('CulturalAchievement seeder finished.');
  }
}
