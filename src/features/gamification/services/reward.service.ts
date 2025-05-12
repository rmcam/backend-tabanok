import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRewardDto, RewardFilterDto, RewardResponseDto, UserRewardFilterDto } from '../dto/reward.dto';
import { UserRewardDto } from '../dto/user-reward.dto';
import { RewardStatus, UserReward } from '../entities/user-reward.entity'; // Importar RewardStatus y UserReward
import { User } from '../../../auth/entities/user.entity'; // Ruta corregida
import { UserRepository } from '../../../auth/repositories/user.repository'; // Ruta corregida
import { Reward } from '../entities/reward.entity'; // Importar la entidad Reward
import { Repository, DataSource } from 'typeorm'; // Importar Repository and DataSource
import { GamificationService } from './gamification.service'; // Keep GamificationService for other methods if needed
import { Gamification } from '../entities/gamification.entity'; // Import Gamification entity

@Injectable()
export class RewardService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository, // Keep for other methods if needed
    @InjectRepository(Reward) // Inyectar el repositorio de Reward
    private rewardRepository: Repository<Reward>,
    @InjectRepository(UserReward) // Inyectar el repositorio de UserReward
    private userRewardRepository: Repository<UserReward>,
    @InjectRepository(Gamification) // Inject Gamification repository
    private gamificationEntityRepository: Repository<Gamification>,
    private gamificationService: GamificationService, // Keep GamificationService for other methods if needed
    private dataSource: DataSource // Inject DataSource
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
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the user
      const user = await queryRunner.manager.findOne(User, { where: { id: userId } }); // Use queryRunner.manager
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Find the reward
      const reward = await queryRunner.manager.findOne(Reward, { where: { id: rewardId } }); // Use queryRunner.manager
      if (!reward) {
        throw new NotFoundException(`Reward with ID ${rewardId} not found`);
      }

      // Create a new UserReward entry
      const userReward = queryRunner.manager.create(UserReward, { // Use queryRunner.manager.create
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
      await queryRunner.manager.save(userReward); // Use queryRunner.manager.save

      // Update user's points directly within the transaction
      if (reward.pointsCost && reward.pointsCost > 0) {
          const gamification = await queryRunner.manager.findOne(Gamification, { where: { userId } }); // Fetch gamification within transaction
          if (gamification) {
              gamification.points += reward.pointsCost;
              gamification.recentActivities.unshift({
                  type: 'reward_awarded', // Tipo de actividad
                  description: `Recompensa otorgada: ${reward.name}`, // Descripción
                  pointsEarned: reward.pointsCost,
                  timestamp: new Date()
              });
              await queryRunner.manager.save(gamification); // Save gamification changes within transaction
          }
      }

      await queryRunner.commitTransaction();

      // TODO: Map saved UserReward to UserRewardDto
      console.log(`Awarded reward ${rewardId} to user ${userId}.`); // Removed user.points as user object might not be updated here
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

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
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
