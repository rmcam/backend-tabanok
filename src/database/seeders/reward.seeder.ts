import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { Reward } from '../../features/gamification/entities/reward.entity';
import { RewardType } from '../../common/enums/reward.enum'; // Importar RewardType enum

export class RewardSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const rewardRepository = this.dataSource.getRepository(Reward);

    const rewardsToSeed = [
      {
        name: 'Medalla de Bienvenida',
        description: 'Recompensa por completar la primera unidad.',
        type: RewardType.BADGE, // Usar valor del enum
        imageUrl: 'http://example.com/badge_bienvenida.png',
      },
      {
        name: 'Puntos Extra',
        description: 'Recompensa de puntos por completar un ejercicio difícil.',
        type: RewardType.POINTS, // Usar valor del enum
        pointsCost: 0, // No tiene costo si es una recompensa ganada
      },
      {
        name: 'Logro: Maestro del Alfabeto',
        description: 'Recompensa por dominar el alfabeto Kamëntsá.',
        type: RewardType.ACHIEVEMENT, // Usar valor del enum
      },
      // Agregar más recompensas según sea necesario
    ];

    for (const rewardData of rewardsToSeed) {
      const existingReward = await rewardRepository.findOne({ where: { name: rewardData.name } });

      if (!existingReward) {
        const newReward = rewardRepository.create(rewardData);
        await rewardRepository.save(newReward);
        console.log(`Reward "${rewardData.name}" seeded.`);
      } else {
        console.log(`Reward "${rewardData.name}" already exists. Skipping.`);
      }
    }
  }
}
