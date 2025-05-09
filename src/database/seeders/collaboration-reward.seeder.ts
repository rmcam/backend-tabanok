import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { CollaborationReward, CollaborationType } from '../../features/gamification/entities/collaboration-reward.entity';

export default class CollaborationRewardSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(CollaborationReward);

    const rewards = [
      {
        type: CollaborationType.CONTENIDO_CREACION,
        title: 'Recompensa por Creación de Contenido',
        description: 'Puntos por crear nuevo contenido.',
        basePoints: 100,
        qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
        history: [],
        streakBonuses: [{ threshold: 3, multiplier: 1.1 }, { threshold: 7, multiplier: 1.25 }],
      },
      {
        type: CollaborationType.CONTENIDO_REVISION,
        title: 'Recompensa por Revisión de Contenido',
        description: 'Puntos por revisar contenido existente.',
        basePoints: 50,
        qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
        history: [],
        streakBonuses: [{ threshold: 5, multiplier: 1.15 }, { threshold: 10, multiplier: 1.3 }],
      },
      {
        type: CollaborationType.CONTRIBUCION_CULTURAL,
        title: 'Recompensa por Contribución Cultural',
        description: 'Puntos por aportar contenido cultural.',
        basePoints: 150,
        qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
        history: [],
        streakBonuses: [{ threshold: 2, multiplier: 1.05 }, { threshold: 5, multiplier: 1.15 }],
      },
      {
        type: CollaborationType.CONTENIDO_TRADUCCION,
        title: 'Recompensa por Traducción de Contenido',
        description: 'Puntos por traducir contenido.',
        basePoints: 120,
        qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
        history: [],
        streakBonuses: [{ threshold: 4, multiplier: 1.1 }, { threshold: 8, multiplier: 1.2 }],
      },
      {
        type: CollaborationType.AYUDA_COMUNITARIA,
        title: 'Recompensa por Ayuda Comunitaria',
        description: 'Puntos por ayudar a otros usuarios.',
        basePoints: 30,
        qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
        history: [],
        streakBonuses: [{ threshold: 7, multiplier: 1.2 }, { threshold: 14, multiplier: 1.4 }],
      },
      {
        type: CollaborationType.REPORTE_ERRORES,
        title: 'Recompensa por Reporte de Errores',
        description: 'Puntos por reportar errores.',
        basePoints: 20,
        qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
        history: [],
        streakBonuses: [{ threshold: 10, multiplier: 1.3 }, { threshold: 20, multiplier: 1.5 }],
      },
    ];

    for (const rewardData of rewards) {
      const existingReward = await repository.findOne({ where: { type: rewardData.type } });

      if (!existingReward) {
        const reward = repository.create(rewardData);
        await repository.save(reward);
        console.log(`Collaboration Reward "${rewardData.title}" seeded.`);
      } else {
        console.log(`Collaboration Reward "${existingReward.title}" already exists. Skipping.`);
      }
    }
  }
}
