import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRewardDto, RewardFilterDto, RewardResponseDto, UserRewardFilterDto } from '../dto/reward.dto';
import { UserRewardDto } from '../dto/user-reward.dto';
import { RewardStatus, UserReward } from '../entities/user-reward.entity'; // Importar RewardStatus y UserReward
import { User } from '../../../auth/entities/user.entity'; // Ruta corregida
import { UserRepository } from '../../../auth/repositories/user.repository'; // Ruta corregida
import { Reward } from '../entities/reward.entity'; // Importar la entidad Reward
import { Repository } from 'typeorm'; // Importar Repository
import { GamificationService } from './gamification.service'; // Importar GamificationService

@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    @InjectRepository(Reward) // Inyectar el repositorio de Reward
    private rewardRepository: Repository<Reward>,
    @InjectRepository(UserReward) // Inyectar el repositorio de UserReward
    private userRewardRepository: Repository<UserReward>,
    private gamificationService: GamificationService, // Inyectar GamificationService
  ) {}

  async createReward(createRewardDto: CreateRewardDto): Promise<RewardResponseDto> {
    const newReward = this.rewardRepository.create({ ...createRewardDto });
    const savedReward = await this.rewardRepository.save(newReward);
    // TODO: Map savedReward to RewardResponseDto
    return savedReward as RewardResponseDto;
  }

  async findAll(): Promise<RewardResponseDto[]> {
    // Implementación básica temporal
    console.log('findAll called');
    return [];
  }

  async getAvailableRewards(filters: RewardFilterDto): Promise<RewardResponseDto[]> {
    // Implementación básica temporal
    console.log('getAvailableRewards called with:', filters);
    return [];
  }

  async awardRewardToUser(userId: string, rewardId: string): Promise<UserRewardDto> {
    // Find the user
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Find the reward
    const reward = await this.rewardRepository.findOne({ where: { id: rewardId } });
    if (!reward) {
      throw new NotFoundException(`Reward with ID ${rewardId} not found`);
    }

    // Create a new UserReward entry
    const userReward = this.userRewardRepository.create({
      userId: user.id,
      rewardId: reward.id,
      status: RewardStatus.ACTIVE,
      dateAwarded: new Date(),
      // Set expiresAt based on reward type or metadata if applicable
      // expiresAt: calculateExpirationDate(reward),
      // Add initial metadata if needed
      // metadata: { usageCount: 0 },
    });

    // Save the UserReward entry
    await this.userRewardRepository.save(userReward);

    // Update user's points using GamificationService
    if (reward.pointsCost && reward.pointsCost > 0) {
        await this.gamificationService.awardPoints(
            userId,
            reward.pointsCost,
            'reward_awarded', // Tipo de actividad
            `Recompensa otorgada: ${reward.name}` // Descripción
        );
    }

    // TODO: Map saved UserReward to UserRewardDto
    console.log(`Awarded reward ${rewardId} to user ${userId}. New points: ${user.points}`);
    return {
      userId: userReward.userId,
      rewardId: userReward.rewardId,
      status: userReward.status,
      dateAwarded: userReward.dateAwarded,
      createdAt: userReward.createdAt,
      consumedAt: userReward.consumedAt,
      expiresAt: userReward.expiresAt,
      metadata: userReward.metadata,
    } as UserRewardDto;
  }

  async getUserRewards(userId: string, filters: UserRewardFilterDto): Promise<UserRewardDto[]> {
    // Implementación básica temporal
    console.log('getUserRewards called with:', userId, filters);
    return [];
  }

  async consumeReward(userId: string, rewardId: string): Promise<UserRewardDto> {
    // Implementación básica temporal
    console.log('consumeReward called with:', userId, rewardId);
    return {} as UserRewardDto;
  }

  async checkAndUpdateRewardStatus(userId: string, rewardId: string): Promise<UserRewardDto> {
    // Implementación básica temporal
    console.log('checkAndUpdateRewardStatus called with:', userId, rewardId);
    return {} as UserRewardDto;
  }
}
