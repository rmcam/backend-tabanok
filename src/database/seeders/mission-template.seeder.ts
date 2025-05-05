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
        conditions: { lessons: 1 }, // Ejemplo de condición
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
        conditions: { exercises: 5 },
        rewards: { points: 50 },
      },
      // Agregar más plantillas de misión según sea necesario
    ];

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
