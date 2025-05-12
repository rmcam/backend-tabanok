
import { DataSource } from 'typeorm';
import { Badge } from '../../features/gamification/entities/badge.entity';
import { DeepPartial } from 'typeorm'; // Importar DeepPartial
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { BadgeTier } from '../../features/gamification/enums/badge-tier.enum'; // Importar el enum BadgeTier

export class BadgeSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const badgeRepository = this.dataSource.getRepository(Badge);

    const badgesToSeed: DeepPartial<Badge>[] = [ // Definir explícitamente el tipo
      // Badges de Progreso
      {
        name: 'Aprendiz de Bronce',
        description: 'Otorgada por completar las primeras lecciones.',
        category: 'Progreso',
        tier: BadgeTier.BRONCE, // Usar el enum
        requiredPoints: 100,
        iconUrl: '/images/badges/aprendiz_bronce.png',
        requirements: { points: 100 },
        isSpecial: false,
        benefits: [{ type: 'points', value: 10, description: '10 puntos extra' }],
      },
      {
        name: 'Explorador de Unidades',
        description: 'Otorgada por completar todas las unidades de un módulo.',
        category: 'Progreso',
        tier: BadgeTier.PLATA, // Usar el enum
        requiredPoints: 500,
        iconUrl: '/images/badges/explorador_unidades.png',
        requirements: { customCriteria: { type: 'modules_completed', value: 'all' } },
        isSpecial: false,
        benefits: [{ type: 'discount', value: 0.1, description: '10% de descuento en la tienda' }],
      },
      {
        name: 'Maestro de Oro',
        description: 'Otorgada por alcanzar un alto nivel de maestría en todas las categorías.',
        category: 'Progreso',
        tier: BadgeTier.ORO, // Usar el enum
        requiredPoints: 1500,
        iconUrl: '/images/badges/maestro_oro.png',
        requirements: { customCriteria: { type: 'overall_mastery', value: 90 } },
        isSpecial: false,
        benefits: [{ type: 'discount', value: 0.25, description: '25% de descuento en la tienda' }],
      },

      // Badges de Constancia
      {
        name: 'Racha Imparable',
        description: 'Otorgada por mantener una racha de estudio de 30 días.',
        category: 'Constancia',
        tier: BadgeTier.PLATA, // Usar el enum
        requiredPoints: 750,
        iconUrl: '/images/badges/racha_imparable.png',
        requirements: { customCriteria: { type: 'streak_days', value: 30 } },
        isSpecial: true,
        benefits: [{ type: 'experience_multiplier', value: 1.5, description: 'Multiplicador de experiencia 1.5x por 24 horas' }],
      },
      {
        name: 'Super Racha',
        description: 'Otorgada por mantener una racha de estudio de 90 días.',
        category: 'Constancia',
        tier: BadgeTier.ORO, // Usar el enum
        requiredPoints: 1200,
        iconUrl: '/images/badges/super_racha.png',
        requirements: { customCriteria: { type: 'streak_days', value: 90 } },
        isSpecial: true,
        benefits: [{ type: 'experience_multiplier', value: 2.0, description: 'Multiplicador de experiencia 2x por 48 horas' }],
      },

      // Badges de Comunidad
      {
        name: 'Colaborador Activo',
        description: 'Otorgada por realizar 10 contribuciones validadas (comentarios, sugerencias).',
        category: 'Comunidad',
        tier: BadgeTier.PLATA, // Usar el enum
        requiredPoints: 600,
        iconUrl: '/images/badges/colaborador_plata.png',
        requirements: { customCriteria: { type: 'contributions_validated', value: 10 } },
        isSpecial: false,
        benefits: [{ type: 'points', value: 50, description: '50 puntos extra' }],
      },
      {
        name: 'Mentor de Oro',
        description: 'Otorgada por ayudar a otros 10 usuarios en los foros o comentarios.',
        category: 'Comunidad',
        tier: BadgeTier.ORO, // Usar el enum
        requiredPoints: 1100,
        iconUrl: '/images/badges/mentor_oro.png',
        requirements: { customCriteria: { type: 'users_helped', value: 10 } },
        isSpecial: false,
        benefits: [{ type: 'customization', value: { customizationType: 'profile_badge', customizationValue: 'Mentor' }, description: 'Insignia de Mentor en el perfil' }],
      },
      {
        name: 'Comentarista Pro',
        description: 'Otorgada por realizar 50 comentarios.',
        category: 'Comunidad',
        tier: BadgeTier.BRONCE, // Usar el enum
        requiredPoints: 300,
        iconUrl: '/images/badges/comentarista_pro.png',
        requirements: { customCriteria: { type: 'comments_count', value: 50 } },
        isSpecial: false,
        benefits: [],
      },

      // Badges Culturales
      {
        name: 'Embajador Cultural',
        description: 'Otorgada por participar en 5 eventos culturales o contribuir con contenido cultural.',
        category: 'Cultura',
        tier: BadgeTier.PLATA, // Usar el enum
        requiredPoints: 800,
        iconUrl: '/images/badges/embajador_cultural.png',
        requirements: { customCriteria: { type: 'cultural_engagement', value: 5 } },
        isSpecial: false,
        benefits: [{ type: 'exclusive_content', value: 'uuid-contenido-cultural-extra', description: 'Acceso a contenido cultural extra' }],
      },

      // Badges Especiales
      {
        name: 'Insignia de Fundador',
        description: 'Insignia especial para los primeros usuarios de la plataforma.',
        category: 'Especial',
        tier: BadgeTier.ORO, // Usar el enum
        requiredPoints: 0, // No requiere puntos, se otorga por criterio especial
        iconUrl: '/images/badges/insignia_fundador.png',
        requirements: { customCriteria: { type: 'user_creation_date', value: 'before_2025-06-01' } },
        isSpecial: true,
        benefits: [{ type: 'customization', value: { customizationType: 'profile_title', customizationValue: 'Fundador' }, description: 'Título de Fundador en el perfil' }],
      },
    ];


    for (const badgeData of badgesToSeed) {
      const existingBadge = await badgeRepository.findOne({ where: { name: badgeData.name } });

      if (!existingBadge) {
        const newBadge = badgeRepository.create(badgeData);
        await badgeRepository.save(newBadge);
        console.log(`Badge "${badgeData.name}" seeded.`);
      } else {
        console.log(`Badge "${badgeData.name}" already exists. Skipping.`);
      }
    }
  }
}
