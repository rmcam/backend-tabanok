import { v4 as uuidv4 } from 'uuid';
import { DataSourceAwareSeed } from './data-source-aware-seed';
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
    ];

    const moreSeasonsToSeed = [
      {
        type: SeasonType.FLOR_DE_MAYO,
        name: 'Temporada de la Flor de Mayo',
        description: 'Celebración de la floración y la renovación.',
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-05-31'),
        culturalElements: {
          traditions: ['Danzas de la flor'],
          vocabulary: ['Flor', 'Primavera'],
          stories: ['Leyendas de la naturaleza'],
        },
        rewards: {
          points: 180,
          specialBadge: 'uuid-medalla-flor',
          culturalItems: ['Objeto Cultural 3'],
        },
        isActive: true,
      },
      {
        type: SeasonType.DIA_GRANDE,
        name: 'Día Grande',
        description: 'La celebración más importante del año Kamëntsá.',
        startDate: new Date('2025-12-29'),
        endDate: new Date('2026-01-06'),
        culturalElements: {
          traditions: ['Carnaval de Negros y Blancos'],
          vocabulary: ['Día Grande', 'Celebración'],
          stories: ['Origen del Día Grande'],
        },
        rewards: {
          points: 300,
          specialBadge: 'uuid-medalla-dia-grande',
          culturalItems: ['Objeto Cultural 4', 'Objeto Cultural 5'],
        },
        isActive: false, // Puede estar inactiva hasta que se acerque la fecha
      },
    ];

    seasonsToSeed.push(...moreSeasonsToSeed);

    for (const seasonData of seasonsToSeed) {
      // Buscar si ya existe una temporada con el mismo nombre y tipo
      const existingSeason = await seasonRepository.findOne({ where: { name: seasonData.name, type: seasonData.type } });

      if (!existingSeason) {
        const newSeason = seasonRepository.create({
          id: uuidv4(),
          ...seasonData,
        });
        await seasonRepository.save(newSeason);
        console.log(`Season "${seasonData.name}" seeded.`);
      } else {
        console.log(`Season "${existingSeason.name}" already exists. Skipping.`);
      }
    }
  }
}
