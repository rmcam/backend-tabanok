import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { MissionTemplate, MissionFrequency } from '../../features/gamification/entities/mission-template.entity'; // Importar MissionFrequency de aquí
import { MissionType } from '../../features/gamification/entities/mission.entity'; // Importar MissionType de mission.entity

export class MissionTemplateSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const missionTemplateRepository = this.dataSource.getRepository(MissionTemplate);

    const missionTemplatesToSeed = [
      {
        title: 'Completa una Lección Diaria',
        description: 'Completa al menos una lección cada día.',
        type: MissionType.COMPLETE_LESSONS, // Usar valor del enum
        frequency: MissionFrequency.DIARIA, // Usar valor del enum de MissionTemplate
        baseTargetValue: 1,
        baseRewardPoints: 20,
        isActive: true,
        minLevel: 1,
        maxLevel: 0, // 0 podría significar sin límite
        conditions: { lessons: 1, exercises: undefined, pointsSource: undefined, streakDays: undefined, achievementType: undefined }, // Ejemplo de condición
        rewards: { points: 20 }, // Ejemplo de recompensa
      },
      {
        title: 'Practica 5 Ejercicios Semanales',
        description: 'Completa 5 ejercicios en una semana.',
        type: MissionType.PRACTICE_EXERCISES, // Usar valor del enum
        frequency: MissionFrequency.SEMANAL, // Usar valor del enum de MissionTemplate
        baseTargetValue: 5,
        baseRewardPoints: 50,
        isActive: true,
        minLevel: 2,
        maxLevel: 0,
        conditions: { lessons: undefined, exercises: 5, pointsSource: undefined, streakDays: undefined, achievementType: undefined },
        rewards: { points: 50 },
      },
    ];

    const moreMissionTemplatesToSeed = [
      {
        title: 'Gana Puntos de Colaboración Mensuales',
        description: 'Gana una cierta cantidad de puntos a través de colaboraciones cada mes.',
        type: MissionType.EARN_POINTS,
        frequency: MissionFrequency.MENSUAL,
        baseTargetValue: 100,
        baseRewardPoints: 150,
        isActive: true,
        minLevel: 3,
        maxLevel: 0,
        conditions: { lessons: undefined, exercises: undefined, pointsSource: 'collaboration', streakDays: undefined, achievementType: undefined },
        rewards: { points: 150 },
      },
      {
        title: 'Mantén tu Racha por 7 Días',
        description: 'No pierdas tu racha de estudio durante 7 días consecutivos.',
        type: MissionType.MAINTAIN_STREAK,
        frequency: MissionFrequency.SEMANAL,
        baseTargetValue: 7,
        baseRewardPoints: 75,
        isActive: true,
        minLevel: 1,
        maxLevel: 0,
        conditions: { lessons: undefined, exercises: undefined, pointsSource: undefined, streakDays: 7, achievementType: undefined },
        rewards: { points: 75, badge: { name: 'Racha de 7 Días', icon: 'icon-url' } },
      },
      {
        title: 'Completa un Logro Cultural',
        description: 'Desbloquea un logro relacionado con la cultura Kamëntsá.',
        type: MissionType.CULTURAL_CONTENT, // O un tipo más específico si existe
        frequency: MissionFrequency.UNICA, // Asumiendo una frecuencia única para logros
        baseTargetValue: 1,
        baseRewardPoints: 200,
        isActive: true,
        minLevel: 5,
        maxLevel: 0,
        conditions: { lessons: undefined, exercises: undefined, pointsSource: undefined, streakDays: undefined, achievementType: 'cultural' },
        rewards: { points: 200, badge: { name: 'Explorador Cultural', icon: 'icon-url' } },
      },
    ];

    missionTemplatesToSeed.push(...moreMissionTemplatesToSeed);

    for (const templateData of missionTemplatesToSeed) {
      const existingTemplate = await missionTemplateRepository.findOne({ where: { title: templateData.title } });

      if (!existingTemplate) {
        const newTemplate = missionTemplateRepository.create(templateData);
        await missionTemplateRepository.save(newTemplate);
        console.log(`Mission Template "${templateData.title}" seeded.`);
      } else {
        console.log(`Mission Template "${templateData.title}" already exists. Skipping.`);
      }
    }
  }
}
