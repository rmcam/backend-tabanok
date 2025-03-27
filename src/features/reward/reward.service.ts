import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Activity } from 'src/activities/entities/activity.entity';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateRewardDto } from './dto/create-reward.dto';
import { Reward } from './entities/reward.entity';

@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(Reward)
    private rewardRepository: Repository<Reward>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) { }

  async create(createRewardDto: CreateRewardDto): Promise<Reward> {
    const reward = this.rewardRepository.create(createRewardDto);

    if (createRewardDto.activityId) {
      const activity = await this.activityRepository.findOne({
        where: { id: createRewardDto.activityId }
      });
      if (!activity) {
        throw new NotFoundException(`Actividad con ID ${createRewardDto.activityId} no encontrada`);
      }
      reward.activity = activity;
    }

    return await this.rewardRepository.save(reward);
  }

  async findAll(): Promise<Reward[]> {
    return await this.rewardRepository.find({
      relations: ['user', 'activity'],
    });
  }

  async findOne(id: string): Promise<Reward> {
    const reward = await this.rewardRepository.findOne({
      where: { id },
      relations: ['user', 'activity'],
    });

    if (!reward) {
      throw new NotFoundException(`Recompensa con ID ${id} no encontrada`);
    }

    return reward;
  }

  async findByUser(userId: number): Promise<Reward[]> {
    return await this.rewardRepository.find({
      where: { user: { id: userId } },
      relations: ['activity'],
    });
  }

  async unlockReward(id: string, user: User): Promise<Reward> {
    const reward = await this.findOne(id);

    if (reward.isUnlocked) {
      return reward;
    }

    reward.isUnlocked = true;
    reward.unlockedAt = new Date();
    reward.user = user;

    return await this.rewardRepository.save(reward);
  }

  async remove(id: string): Promise<void> {
    const reward = await this.findOne(id);
    await this.rewardRepository.remove(reward);
  }
}
