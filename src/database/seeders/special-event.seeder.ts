import { DataSourceAwareSeed } from './data-source-aware-seed';
import { DataSource } from 'typeorm';
import { SpecialEvent, EventType } from '../../features/gamification/entities/special-event.entity'; // Importar EventType enum
import { Season } from '../../features/gamification/entities/season.entity'; // Importar Season

export class SpecialEventSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const specialEventRepository = this.dataSource.getRepository(SpecialEvent);
    const seasonRepository = this.dataSource.getRepository(Season);

    const seasons = await seasonRepository.find();

    if (seasons.length === 0) {
      console.log('No seasons found. Skipping SpecialEventSeeder.');
      return;
    }

    const specialEventsToSeed = [
      {
        name: 'Festival de la Cosecha',
        description: 'Evento especial para celebrar la cosecha.',
        type: EventType.FESTIVAL, // Usar valor del enum
        startDate: new Date('2025-05-10'), // Fechas de ejemplo
        endDate: new Date('2025-05-15'),
        rewards: { points: 300, culturalValue: 50, specialBadge: 'uuid-medalla-cosecha' },
        requirements: { minLevel: 3 },
        culturalElements: { traditions: ['Danzas'], vocabulary: ['Cosecha'], activities: ['Recolección'] },
        seasonName: 'Temporada de Siembra',
        isActive: true,
      },
      {
        name: 'Taller de Idioma Avanzado',
        description: 'Taller intensivo de Kamëntsá para niveles avanzados.',
        type: EventType.TALLER,
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-05'),
        rewards: { points: 100, culturalValue: 20, specialBadge: null }, // Añadir specialBadge
        requirements: { minLevel: 5 },
        culturalElements: { traditions: [], vocabulary: ['Gramática'], activities: ['Ejercicios'] },
        seasonName: 'Temporada de Siembra',
        isActive: true,
      },
      {
        name: 'Ceremonia de Armonización',
        description: 'Evento espiritual para la conexión con la naturaleza.',
        type: EventType.CEREMONIA,
        startDate: new Date('2025-08-20'),
        endDate: new Date('2025-08-20'),
        rewards: { points: 250, culturalValue: 70, specialBadge: null }, // Añadir specialBadge
        requirements: { minLevel: 7 },
        culturalElements: { traditions: ['Rituales'], vocabulary: ['Espíritu'], activities: ['Meditación'] },
        seasonName: 'Temporada de Siembra',
        isActive: true,
      },
      {
        name: 'Exposición de Artesanía',
        description: 'Muestra de trabajos artesanales de la comunidad.',
        type: EventType.EXPOSICION,
        startDate: new Date('2025-10-10'),
        endDate: new Date('2025-10-12'),
        rewards: { points: 150, culturalValue: 40, specialBadge: null }, // Añadir specialBadge
        requirements: { minLevel: 1 },
        culturalElements: { traditions: ['Artesanía'], vocabulary: ['Tejido', 'Cerámica'], activities: ['Observación'] },
        seasonName: 'Temporada de Carnaval',
        isActive: true,
      },
    ];

    for (const eventData of specialEventsToSeed) {
      // Buscar si ya existe un evento con el mismo nombre y tipo
      const existingEvent = await specialEventRepository.findOne({ where: { name: eventData.name, type: eventData.type } });

      if (!existingEvent) {
        const season = seasons.find(s => s.name === eventData.seasonName);

        if (season) {
          const newEvent = specialEventRepository.create({
            ...eventData,
            season: season,
          });
          await specialEventRepository.save(newEvent);
          console.log(`Special Event "${eventData.name}" seeded.`);
        } else {
          console.log(`Season "${eventData.seasonName}" not found for Special Event "${eventData.name}". Skipping.`);
        }
      } else {
        console.log(`Special Event "${existingEvent.name}" already exists. Skipping.`);
      }
    }
  }
}
