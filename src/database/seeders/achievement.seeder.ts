import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { Achievement } from '../../features/gamification/entities/achievement.entity';

export class AchievementSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const achievementRepository = this.dataSource.getRepository(Achievement);

    const achievementsToSeed = [
      {
        name: 'Primeros Pasos',
        description: 'Completa tu primera lección.',
        iconUrl: 'http://example.com/icon_primerospasos.png',
        criteria: 'lessons_completed',
        requirement: 1,
        bonusPoints: 50,
        badge: { id: 'uuid-de-medalla-ejemplo', name: 'Medalla de Inicio', icon: 'http://example.com/badge_inicio.png' }, // Ejemplo de badge asociado
      },
      {
        name: 'Explorador de Unidades',
        description: 'Completa 3 unidades.',
        iconUrl: 'http://example.com/icon_explorador.png',
        criteria: 'unities_completed',
        requirement: 3,
        bonusPoints: 100,
        badge: null, // Sin badge asociado
      },
      // Agregar más logros según sea necesario
    ];

    for (const achievementData of achievementsToSeed) {
      const existingAchievement = await achievementRepository.findOne({ where: { name: achievementData.name } });

      if (!existingAchievement) {
        const newAchievement = achievementRepository.create(achievementData);
        await achievementRepository.save(newAchievement);
        console.log(`Achievement "${achievementData.name}" seeded.`);
      } else {
        console.log(`Achievement "${achievementData.name}" already exists. Skipping.`);
      }
    }
  }
}
