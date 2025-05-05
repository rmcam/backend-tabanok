import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { Season, SeasonType } from '../../features/gamification/entities/season.entity'; // Importar SeasonType enum

export class SeasonSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const seasonRepository = this.dataSource.getRepository(Season);

    const seasonsToSeed = [
      {
        type: SeasonType.BETSCNATE, // Usar valor del enum
        name: 'Temporada de Carnaval',
        description: 'Temporada festiva con eventos especiales.',
        startDate: new Date('2025-02-01'), // Fechas de ejemplo
        endDate: new Date('2025-03-15'),
        culturalElements: {
          traditions: ['Desfiles', 'Música'],
          vocabulary: ['Máscara', 'Disfraz'],
          stories: ['Historia del Carnaval'],
        },
        rewards: {
          points: 200,
          specialBadge: 'uuid-medalla-carnaval', // ID de una medalla especial (debe existir)
          culturalItems: ['Objeto Cultural 1'],
        },
        isActive: true,
      },
      {
        type: SeasonType.JAJAN, // Usar valor del enum
        name: 'Temporada de Siembra',
        description: 'Enfocada en la conexión con la naturaleza y la agricultura.',
        startDate: new Date('2025-04-01'), // Fechas de ejemplo
        endDate: new Date('2025-06-30'),
        culturalElements: {
          traditions: ['Rituales de siembra'],
          vocabulary: ['Semilla', 'Tierra'],
          stories: ['Mitos de origen'],
        },
        rewards: {
          points: 150,
          specialBadge: null,
          culturalItems: ['Objeto Cultural 2'],
        },
        isActive: false, // Ejemplo de temporada inactiva
      },
      // Agregar más temporadas según sea necesario
    ];

    for (const seasonData of seasonsToSeed) {
      // Buscar si ya existe una temporada con el mismo nombre y tipo
      const existingSeason = await seasonRepository.findOne({ where: { name: seasonData.name, type: seasonData.type } });

      if (!existingSeason) {
        const newSeason = seasonRepository.create(seasonData);
        await seasonRepository.save(newSeason);
        console.log(`Season "${seasonData.name}" seeded.`);
      } else {
        console.log(`Season "${existingSeason.name}" already exists. Skipping.`);
      }
    }
  }
}
