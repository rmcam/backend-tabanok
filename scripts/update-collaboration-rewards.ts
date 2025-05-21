
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { CollaborationRewardService } from '../src/features/gamification/services/collaboration-reward.service';

async function updateCollaborationRewards() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const collaborationRewardService = app.get(CollaborationRewardService);

  try {
    const rewards = await collaborationRewardService['collaborationRewardRepository'].find();

    for (const reward of rewards) {
      if (!reward.qualityMultipliers) {
        reward.qualityMultipliers = {
          excellent: 1.2,
          good: 1.0,
          average: 0.8,
        };
        await collaborationRewardService['collaborationRewardRepository'].save(reward);
        console.log(`Updated qualityMultipliers for reward ${reward.id}`);
      } else {
        console.log(`Reward ${reward.id} already has qualityMultipliers`);
      }
    }

    console.log('Finished updating collaboration rewards');
  } catch (error) {
    console.error('Error updating collaboration rewards:', error);
  } finally {
    await app.close();
  }
}

updateCollaborationRewards();
