import { DataSource, Repository } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { CulturalAchievement, AchievementCategory, AchievementType, AchievementTier } from '../../features/gamification/entities/cultural-achievement.entity'; // Importar entidad y enums
import { AchievementProgress } from '../../features/gamification/entities/achievement-progress.entity'; // Importar AchievementProgress
import { Inject } from '@nestjs/common'; // Importar Inject

export class CulturalAchievementSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const culturalAchievementRepository = this.dataSource.getRepository(CulturalAchievement);
    const achievementProgressRepository = this.dataSource.getRepository(AchievementProgress);

    const culturalAchievementsToSeed = [
      // Logros Culturales de Aprendizaje
      {
        name: 'Explorador Cultural',
        description: 'Completa lecciones en 3 categorías culturales diferentes.',
        iconUrl: '/icons/cultural_explorer.png',
        category: AchievementCategory.TRADICION,
        type: AchievementType.APRENDIZAJE_CULTURAL, // Usar APRENDIZAJE_CULTURAL
        tier: AchievementTier.BRONCE,
        requirements: [{ type: 'categories_completed', value: 3, description: 'Completar 3 categorías culturales' }],
        pointsReward: 100,
        isActive: true,
        isSecret: false,
      },
      {
        name: 'Guardián de la Historia',
        description: 'Completa todas las lecciones de historia.',
        iconUrl: '/icons/history_guardian.png',
        category: AchievementCategory.HISTORIA,
        type: AchievementType.APRENDIZAJE_CULTURAL, // Usar APRENDIZAJE_CULTURAL
        tier: AchievementTier.PLATA,
        requirements: [{ type: 'lessons_in_category_completed', value: 10, description: 'Completar 10 lecciones de historia' }],
        pointsReward: 250,
        isActive: true,
        isSecret: false,
      },
      {
        name: 'Maestro Artesano',
        description: 'Completa todos los ejercicios de artesanía con un 90% de precisión.',
        iconUrl: '/icons/craft_master.png',
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
      {
        name: 'Conocedor de Rituales',
        description: 'Completa todas las lecciones sobre rituales y ceremonias.',
        iconUrl: '/icons/ritual_expert.png',
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
        iconUrl: '/icons/myth_collector.png',
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
        iconUrl: '/icons/certified_historian.png',
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

      // Nuevos logros culturales
      {
        name: 'Músico Tradicional',
        description: 'Completa todas las lecciones sobre música Kamëntsá.',
        iconUrl: '/icons/traditional_musician.png',
        category: AchievementCategory.MUSICA, // Asumiendo una categoría de música
        type: AchievementType.APRENDIZAJE_CULTURAL,
        tier: AchievementTier.PLATA,
        requirements: [{ type: 'lessons_in_category_completed', value: 7, description: 'Completar 7 lecciones de música' }],
        pointsReward: 350,
        isActive: true,
        isSecret: false,
      },
      {
        name: 'Danzante Ceremonial',
        description: 'Completa todas las lecciones sobre danzas Kamëntsá.',
        iconUrl: '/icons/ceremonial_dancer.png',
        category: AchievementCategory.RITUALES, // O una categoría de danza si existe
        type: AchievementType.APRENDIZAJE_CULTURAL,
        tier: AchievementTier.PLATA,
        requirements: [{ type: 'lessons_in_category_completed', value: 6, description: 'Completar 6 lecciones de danza' }],
        pointsReward: 320,
        isActive: true,
        isSecret: false,
      },
      {
        name: 'Conocedor de Plantas',
        description: 'Identifica correctamente 20 plantas medicinales o alimenticias en ejercicios.',
        iconUrl: '/icons/plant_expert.png',
        category: AchievementCategory.MEDICINA, // Usar MEDICINA como categoría relacionada con plantas medicinales
        type: AchievementType.DOMINIO_CULTURAL,
        tier: AchievementTier.BRONCE,
        requirements: [{ type: 'exercises_in_category_completed', value: 20, description: 'Completar 20 ejercicios de identificación de plantas' }],
        pointsReward: 180,
        isActive: true,
        isSecret: false,
      },
      {
        name: 'Narrador de Cuentos',
        description: 'Lee 10 cuentos o narraciones tradicionales en Kamëntsá.',
        iconUrl: '/icons/storyteller.png',
        category: AchievementCategory.MITOS_LEYENDAS,
        type: AchievementType.EXPLORACION_CONTENIDO,
        tier: AchievementTier.PLATA,
        requirements: [{ type: 'content_items_viewed', value: 10, description: 'Ver 10 elementos de contenido de cuentos' }],
        pointsReward: 220,
        isActive: true,
        isSecret: false,
      },
    ];
    
    for (const achievementData of culturalAchievementsToSeed) {
      const existingAchievement = await culturalAchievementRepository.findOne({ where: { name: achievementData.name } });

      if (!existingAchievement) {
        const newAchievement = culturalAchievementRepository.create({
          ...achievementData,
        });
        await culturalAchievementRepository.save(newAchievement);
        console.log(`Cultural Achievement "${achievementData.name}" seeded.`);
      } else {
        console.log(`Cultural Achievement "${existingAchievement.name}" already exists. Skipping.`);
      }
    }

    console.log('CulturalAchievement seeder finished.');
  }
}
