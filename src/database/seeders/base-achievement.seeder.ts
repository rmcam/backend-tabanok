import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { BaseAchievement } from '../../features/gamification/entities/base-achievement.entity';

export default class BaseAchievementSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(BaseAchievement);

    const achievements = [
      {
        name: 'Primeros Pasos',
        description: 'Completa tu primera lección.',
        iconUrl: 'https://example.com/icons/first_steps.png',
      },
      {
        name: 'Explorador del Lenguaje',
        description: 'Completa 5 lecciones.',
        iconUrl: 'https://example.com/icons/explorer.png',
      },
      {
        name: 'Maestro de la Gramática',
        description: 'Completa todos los ejercicios de gramática.',
        iconUrl: 'https://example.com/icons/grammar_master.png',
      },
      {
        name: 'Experto en Vocabulario',
        description: 'Aprende 50 palabras nuevas.',
        iconUrl: 'https://example.com/icons/vocabulary_expert.png',
      },
      {
        name: 'Participante Activo',
        description: 'Realiza 10 comentarios en lecciones o ejercicios.',
        iconUrl: 'https://example.com/icons/active_participant.png',
      },
      {
        name: 'Colaborador Destacado',
        description: 'Realiza 5 contribuciones validadas al diccionario.',
        iconUrl: 'https://example.com/icons/contributor.png',
      },
      {
        name: 'Módulo Completo',
        description: 'Completa un módulo entero del curso.',
        iconUrl: 'https://example.com/icons/module_complete.png',
      },
      {
        name: 'Racha de 7 Días',
        description: 'Mantén una racha de estudio de 7 días consecutivos.',
        iconUrl: 'https://example.com/icons/7_day_streak.png',
      },
    ];

    for (const achievementData of achievements) {
      const existingAchievement = await repository.findOne({ where: { name: achievementData.name } });

      if (!existingAchievement) {
        const achievement = repository.create(achievementData);
        await repository.save(achievement);
        console.log(`Base Achievement "${achievementData.name}" seeded.`);
      } else {
        console.log(`Base Achievement "${existingAchievement.name}" already exists. Skipping.`);
      }
    }
  }
}
