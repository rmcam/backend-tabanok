import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { Reward, RewardType } from './entities/reward.entity';

@Injectable()
export class RewardService {
    constructor(
        @InjectRepository(Reward)
        private readonly rewardRepository: Repository<Reward>,
    ) { }

    async create(createRewardDto: CreateRewardDto): Promise<Reward> {
        const reward = this.rewardRepository.create(createRewardDto);
        return await this.rewardRepository.save(reward);
    }

    async findAll(): Promise<Reward[]> {
        return await this.rewardRepository.find({
            where: { isActive: true },
            relations: ['userRewards', 'userRewards.user'],
        });
    }

    async findOne(id: string): Promise<Reward> {
        const reward = await this.rewardRepository.findOne({
            where: { id, isActive: true },
            relations: ['userRewards', 'userRewards.user'],
        });

        if (!reward) {
            throw new NotFoundException(`Reward with ID ${id} not found`);
        }

        return reward;
    }

    async findByType(type: RewardType): Promise<Reward[]> {
        return await this.rewardRepository.find({
            where: { type, isActive: true },
            relations: ['userRewards', 'userRewards.user'],
        });
    }

    async findByUser(userId: string): Promise<Reward[]> {
        return await this.rewardRepository.find({
            where: {
                userRewards: {
                    userId: userId
                },
                isActive: true
            },
            relations: ['userRewards', 'userRewards.user']
        });
    }

    async update(id: string, updateRewardDto: UpdateRewardDto): Promise<Reward> {
        const reward = await this.findOne(id);
        Object.assign(reward, updateRewardDto);
        return await this.rewardRepository.save(reward);
    }

    async remove(id: string): Promise<void> {
        const reward = await this.findOne(id);
        reward.isActive = false;
        await this.rewardRepository.save(reward);
    }

    async updatePoints(id: string, points: number): Promise<Reward> {
        const reward = await this.findOne(id);
        reward.points = points;
        return await this.rewardRepository.save(reward);
    }

    async toggleSecret(id: string): Promise<Reward> {
        const reward = await this.findOne(id);
        reward.isSecret = !reward.isSecret;
        return await this.rewardRepository.save(reward);
    }
}
