import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../auth/entities/user.entity'; // Ruta corregida
import { RewardTrigger, RewardType } from '../../../common/enums/reward.enum';
import { NotificationService } from '../../notifications/services/notification.service';
import { RewardResponseDto } from '../dto/reward-response.dto';
import { UserRewardDto } from '../dto/user-reward.dto';
import { Reward } from '../../reward/entities/reward.entity';
import { UserLevel } from '../entities/user-level.entity';
import { RewardStatus, UserReward } from '../entities/user-reward.entity';

@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(UserReward)
    private readonly userRewardRepository: Repository<UserReward>,
    @InjectRepository(UserLevel)
    private userLevelRepository: Repository<UserLevel>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private notificationService: NotificationService,
  ) {}

  private mapRewardToDto(reward: Reward): RewardResponseDto {
    return {
      id: reward.id,
      name: reward.name,
      description: reward.description,
      type: reward.type,
      trigger: reward.trigger,
      conditions: reward.conditions || [],
      rewardValue: reward.rewardValue,
      isActive: reward.isActive,
      isLimited: reward.isLimited || false,
      limitedQuantity: reward.limitedQuantity,
      timesAwarded: reward.timesAwarded || 0,
      startDate: reward.startDate,
      endDate: reward.endDate,
      createdAt: reward.createdAt,
      updatedAt: reward.updatedAt,
    };
  }

  private mapUserRewardToDto(
    userReward: UserReward & { user: User; reward: Reward },
  ): UserRewardDto {
    return {
      userId: userReward.userId,
      rewardId: userReward.rewardId,
      status: userReward.status,
      metadata: userReward.metadata,
      consumedAt: userReward.consumedAt,
      expiresAt: userReward.expiresAt,
      dateAwarded: userReward.dateAwarded,
      createdAt: userReward.createdAt,
    };
  }

  async createReward(data: {
    name: string;
    description: string;
    type: RewardType;
    trigger: RewardTrigger;
    conditions: { type: string; value: number; description: string }[];
    rewardValue: { type: string; value: any; metadata?: Record<string, any> };
    isLimited?: boolean;
    limitedQuantity?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<RewardResponseDto> {
    const reward = this.rewardRepository.create(data);
    const savedReward = await this.rewardRepository.save(reward);
    return this.mapRewardToDto(savedReward);
  }

  async getAvailableRewards(filters?: {
    type?: RewardType;
    trigger?: RewardTrigger;
    isActive?: boolean;
  }): Promise<RewardResponseDto[]> {
    const rewards = await this.rewardRepository.find({
      where: {
        isActive: true,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.trigger && { trigger: filters.trigger }),
      },
    });
    return rewards.map((reward) => this.mapRewardToDto(reward));
  }

  async awardRewardToUser(
    userId: string,
    rewardId: string,
  ): Promise<UserRewardDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['progress', 'userRewards', 'achievements'],
    });
    const reward = await this.rewardRepository.findOne({
      where: { id: rewardId },
    });

    if (!user || !reward) {
      throw new NotFoundException('Usuario o recompensa no encontrada');
    }

    if (!reward.isActive) {
      throw new BadRequestException('La recompensa no está activa');
    }

    const userReward = this.userRewardRepository.create({
      userId: userId,
      rewardId: rewardId,
      status: RewardStatus.ACTIVE,
      dateAwarded: new Date(),
      metadata: {
        usageCount: 0,
        lastUsed: null,
        expirationDate: null,
        additionalData: {},
      },
    });

    const savedReward = await this.userRewardRepository.save(userReward);
    await this.applyRewardEffect(user, reward);

    return this.mapUserRewardToDto({
      ...savedReward,
      user,
      reward,
    });
  }

  private async applyRewardEffect(user: User, reward: Reward): Promise<void> {
    switch (reward.type) {
      case RewardType.POINTS:
        user.culturalPoints += reward.rewardValue.value;
        await this.userRepository.save(user);
        break;

      case RewardType.BADGE:
      case RewardType.CULTURAL:
      case RewardType.EXPERIENCE:
      case RewardType.CONTENT:
        // Estos tipos solo requieren el registro en UserReward
        break;
    }
  }

  async getUserRewards(userId: string): Promise<UserReward[]> {
    return this.userRewardRepository.find({
      where: {
        userId: userId,
        status: RewardStatus.ACTIVE,
      },
      relations: ['reward'],
    });
  }

  async checkAndUpdateRewardStatus(
    userId: string,
    rewardId: string,
  ): Promise<UserRewardDto> {
    const reward = await this.rewardRepository.findOne({
      where: { id: rewardId },
    });

    if (!reward.isActive) {
      throw new BadRequestException('La recompensa no está activa');
    }

    const userReward = await this.userRewardRepository.findOne({
      where: {
        userId: userId,
        rewardId: rewardId,
      },
      relations: ['user', 'reward'],
    });

    if (!userReward) {
      throw new NotFoundException(
        `UserReward not found for user ${userId} and reward ${rewardId}`,
      );
    }

    // Aquí tu lógica para actualizar el estado

    const savedReward = await this.userRewardRepository.save(userReward);
    return this.mapUserRewardToDto(savedReward);
  }

  private async getRewardById(rewardId: string): Promise<Reward> {
    const reward = await this.rewardRepository.findOne({
      where: { id: rewardId },
    });
    if (!reward) {
      throw new NotFoundException(
        `Recompensa no encontrada para el ID ${rewardId}`,
      );
    }
    return reward;
  }

  async consumeReward(
    userId: string,
    rewardId: string,
  ): Promise<UserRewardDto> {
    const userReward = await this.userRewardRepository.findOne({
      where: {
        userId: userId,
        rewardId: rewardId,
        status: RewardStatus.ACTIVE,
      },
      relations: ['reward'],
    });

    if (!userReward) {
      throw new NotFoundException(
        `UserReward not found for user ${userId} and reward ${rewardId}`,
      );
    }

    if (!userReward.reward.isActive) {
      throw new BadRequestException('La recompensa no está activa');
    }

    // Aquí puedes agregar lógica adicional para consumir la recompensa, si es necesario

    userReward.status = RewardStatus.CONSUMED; // Actualiza el estado a consumido
    userReward.consumedAt = new Date(); // Marca la fecha de consumo

    const savedUserReward = await this.userRewardRepository.save(userReward);
    return this.mapUserRewardToDto(savedUserReward);
  }
}
