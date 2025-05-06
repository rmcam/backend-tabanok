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
    ];

    const moreCulturalAchievementsToSeed = [
      {
        name: 'Conocedor de Rituales',
        description: 'Completa todas las lecciones sobre rituales y ceremonias.',
        iconUrl: 'http://example.com/icons/ritual_expert.png',
        category: AchievementCategory.RITUALES,
        type: AchievementType.APRENDIZAJE_CULTURAL,
        tier: AchievementTier.PLATA,
        requirements: [{ type: 'lessons_in_category_completed', value: 8, description: 'Completar 8 lecciones de rituales' }],
        pointsReward: 300,
        isActive: true,
        isSecret: false,
      },
      {
        name: 'Coleccionista de Mitos',
        description: 'Descubre y lee 5 mitos o leyendas Kamëntsá.',
        iconUrl: 'http://example.com/icons/myth_collector.png',
        category: AchievementCategory.MITOS_LEYENDAS,
        type: AchievementType.EXPLORACION_CONTENIDO,
        tier: AchievementTier.BRONCE,
        requirements: [{ type: 'content_items_viewed', value: 5, description: 'Ver 5 elementos de contenido de mitos' }],
        pointsReward: 150,
        isActive: true,
        isSecret: false,
      },
      {
        name: 'Historiador Certificado',
        description: 'Responde correctamente el 95% de las preguntas en los cuestionarios de historia.',
        iconUrl: 'http://example.com/icons/certified_historian.png',
        category: AchievementCategory.HISTORIA,
        type: AchievementType.DOMINIO_CULTURAL,
        tier: AchievementTier.ORO,
        requirements: [
          { type: 'quizzes_in_category_completed', value: 5, description: 'Completar 5 cuestionarios de historia' },
          { type: 'average_score_in_category', value: 95, description: 'Promedio del 95% en cuestionarios de historia' },
        ],
        pointsReward: 600,
        isActive: true,
        isSecret: false,
      },
    ];

    culturalAchievementsToSeed.push(...moreCulturalAchievementsToSeed);

    // Eliminar logros culturales existentes para evitar duplicados
    await culturalAchievementRepository.clear();

    await culturalAchievementRepository.save(culturalAchievementsToSeed);

    console.log('CulturalAchievement seeder finished.');
  }
}
