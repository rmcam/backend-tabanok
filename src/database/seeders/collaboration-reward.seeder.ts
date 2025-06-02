import { DataSource } from 'typeorm';
import { CollaborationReward, CollaborationType } from '../../features/gamification/entities/collaboration-reward.entity';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class CollaborationRewardSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const repository = this.dataSource.getRepository(CollaborationReward);
    const rewardsJsonPath = path.resolve(__dirname, '../files/json/collaboration_rewards.json');

    try {
      const rewardsJsonContent = JSON.parse(fs.readFileSync(rewardsJsonPath, 'utf-8'));

      for (const rewardData of rewardsJsonContent) {
        const existingReward = await repository.findOne({ where: { type: rewardData.type as CollaborationType } });

        if (!existingReward) {
          const reward = repository.create({
            id: uuidv4(),
            type: rewardData.type as CollaborationType,
            title: rewardData.title,
            description: rewardData.description,
            basePoints: rewardData.basePoints,
            qualityMultipliers: rewardData.qualityMultipliers,
            history: rewardData.history || [],
            streakBonuses: rewardData.streakBonuses || [],
          });
          await repository.save(reward);
          console.log(`Collaboration Reward "${rewardData.title}" seeded.`);
        } else {
          console.log(`Collaboration Reward "${existingReward.title}" already exists. Skipping.`);
        }
      }
    } catch (error) {
      console.error('Error seeding collaboration rewards:', error);
    }
  }
}
