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
      // Agregar más medallas según sea necesario
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
