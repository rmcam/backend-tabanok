import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { Badge } from '../../features/gamification/entities/badge.entity';
import { DeepPartial } from 'typeorm'; // Importar DeepPartial

export class BadgeSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const badgeRepository = this.dataSource.getRepository(Badge);

    const badgesToSeed: DeepPartial<Badge>[] = [ // Definir explícitamente el tipo
      {
        name: 'Aprendiz de Bronce',
        description: 'Otorgada por completar las primeras lecciones.',
        category: 'Progreso',
        tier: 'bronze', // Usar valor del enum
        requiredPoints: 100,
        iconUrl: 'http://example.com/badge_bronce.png',
        requirements: { points: 100 },
        isSpecial: false,
        benefits: [{ type: 'points', value: 10, description: '10 puntos extra' }],
      },
      {
        name: 'Colaborador de Plata',
        description: 'Otorgada por contribuir al contenido.',
        category: 'Colaboración',
        tier: 'silver', // Usar valor del enum
        requiredPoints: 500,
        iconUrl: 'http://example.com/badge_plata.png',
        requirements: { customCriteria: { type: 'contributions', value: 5 } },
        isSpecial: false,
        benefits: [],
      },
    ];

    const moreBadgesToSeed: DeepPartial<Badge>[] = [
      {
        name: 'Maestro de Oro',
        description: 'Otorgada por completar todos los módulos.',
        category: 'Progreso',
        tier: 'gold',
        requiredPoints: 1000,
        iconUrl: 'http://example.com/badge_oro.png',
        requirements: { customCriteria: { type: 'modules_completed', value: 'all' } },
        isSpecial: false,
        benefits: [{ type: 'discount', value: 0.1, description: '10% de descuento en la tienda' }],
      },
      {
        name: 'Racha Imparable',
        description: 'Otorgada por mantener una racha de estudio de 30 días.',
        category: 'Constancia',
        tier: 'silver',
        requiredPoints: 750,
        iconUrl: 'http://example.com/badge_racha.png',
        requirements: { customCriteria: { type: 'streak_days', value: 30 } },
        isSpecial: true,
        benefits: [],
      },
      {
        name: 'Comentarista Pro',
        description: 'Otorgada por realizar 50 comentarios.',
        category: 'Comunidad',
        tier: 'bronze',
        requiredPoints: 300,
        iconUrl: 'http://example.com/badge_comentarista.png',
        requirements: { customCriteria: { type: 'comments_count', value: 50 } },
        isSpecial: false,
        benefits: [],
      },
    ];

    badgesToSeed.push(...moreBadgesToSeed);

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
