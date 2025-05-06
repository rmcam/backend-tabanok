import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { Reward } from '../../features/reward/entities/reward.entity';
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
        title: 'Medalla de Bienvenida',
        description: 'Recompensa por completar la primera unidad.',
        type: RewardType.BADGE, // Usar valor del enum
        imageUrl: 'http://example.com/badge_bienvenida.png',
      },
      {
        name: 'Puntos Extra',
        title: 'Puntos Extra',
        description: 'Recompensa de puntos por completar un ejercicio difícil.',
        type: RewardType.POINTS, // Usar valor del enum
        pointsCost: 0, // No tiene costo si es una recompensa ganada
      },
      {
        name: 'Logro: Maestro del Alfabeto',
        title: 'Logro: Maestro del Alfabeto',
        description: 'Recompensa por dominar el alfabeto Kamëntsá.',
        type: RewardType.ACHIEVEMENT, // Usar valor del enum
      },
    ];

    const moreRewardsToSeed = [
      {
        name: 'Descuento en la Tienda',
        title: 'Descuento en la Tienda',
        description: 'Obtén un 10% de descuento en la tienda de Tabanok.',
        type: RewardType.DISCOUNT,
        pointsCost: 500,
      },
      {
        name: 'Acceso a Contenido Exclusivo',
        title: 'Acceso a Contenido Exclusivo',
        description: 'Desbloquea una lección especial sobre cultura Kamëntsá.',
        type: RewardType.EXCLUSIVE_CONTENT,
        pointsCost: 750,
      },
      {
        name: 'Título Personalizado',
        title: 'Título Personalizado',
        description: 'Elige un título especial para tu perfil.',
        type: RewardType.CUSTOMIZATION,
        pointsCost: 1000,
      },
    ];

    rewardsToSeed.push(...moreRewardsToSeed);

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
