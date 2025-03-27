import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from 'src/activities/entities/activity.entity';
import { Reward } from './entities/reward.entity';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reward, Activity])],
  controllers: [RewardController],
  providers: [RewardService],
  exports: [RewardService],
})
export class RewardModule { }
