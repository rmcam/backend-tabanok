import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'; // Importar BadRequestException
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRewardDto, RewardFilterDto, RewardResponseDto, UserRewardFilterDto } from '../dto/reward.dto';
import { UserRewardDto } from '../dto/user-reward.dto';
import { RewardStatus, UserReward } from '../entities/user-reward.entity';
import { User } from '../../../auth/entities/user.entity';
import { UserRepository } from '../../../auth/repositories/user.repository';

import { Repository, DataSource } from 'typeorm'; // Importar Repository and DataSource
import { GamificationService } from './gamification.service';
import { RewardType } from '../../../common/enums/reward.enum'; // Importar RewardType
import { Reward } from '@/features/reward/entities/reward.entity';
import { Gamification } from '../entities/gamification.entity'; // Import Gamification entity

@Injectable()
export class UserRewardService { // Renombrado a UserRewardService
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
    // Map savedReward to RewardResponseDto
    return {
        id: savedReward.id,
        name: savedReward.name,
        description: savedReward.description,
        type: savedReward.type,
        trigger: savedReward.trigger,
        conditions: savedReward.conditions,
        rewardValue: savedReward.rewardValue,
        isActive: savedReward.isActive,
        isLimited: savedReward.isLimited,
        limitedQuantity: savedReward.limitedQuantity,
        timesAwarded: savedReward.timesAwarded,
        startDate: savedReward.startDate,
        endDate: savedReward.endDate,
        createdAt: savedReward.createdAt,
        updatedAt: savedReward.updatedAt,
    } as RewardResponseDto;
  }

  async findAll(): Promise<RewardResponseDto[]> {
    // Implementación básica: encontrar todas las recompensas activas
    const rewards = await this.rewardRepository.find({
        where: { isActive: true },
        relations: ['userRewards'], // Incluir userRewards si es necesario para el DTO
    });
    // Map rewards to RewardResponseDto[]
    return rewards.map(reward => ({
        id: reward.id,
        name: reward.name,
        description: reward.description,
        type: reward.type,
        trigger: reward.trigger,
        conditions: reward.conditions,
        rewardValue: reward.rewardValue,
        isActive: reward.isActive,
        isLimited: reward.isLimited,
        limitedQuantity: reward.limitedQuantity,
        timesAwarded: reward.timesAwarded,
        startDate: reward.startDate,
        endDate: reward.endDate,
        createdAt: reward.createdAt,
        updatedAt: reward.updatedAt,
    })) as RewardResponseDto[];
  }

  async getAvailableRewards(filters: RewardFilterDto): Promise<RewardResponseDto[]> {
    // Implementación básica: encontrar recompensas activas que coincidan con los filtros
    const queryBuilder = this.rewardRepository.createQueryBuilder('reward');

    queryBuilder.where('reward.isActive = :isActive', { isActive: true });

    if (filters.type) {
        queryBuilder.andWhere('reward.type = :type', { type: filters.type });
    }
    if (filters.trigger) { // Added trigger filter
        queryBuilder.andWhere('reward.trigger = :trigger', { trigger: filters.trigger });
    }
    if (filters.isActive !== undefined) { // Added isActive filter
         queryBuilder.andWhere('reward.isActive = :isActiveFilter', { isActiveFilter: filters.isActive });
    }
    // TODO: Add more filter conditions as needed (e.g., isLimited, startDate, endDate)

    const availableRewards = await queryBuilder.getMany();

    // Map availableRewards to RewardResponseDto[]
     return availableRewards.map(reward => ({
        id: reward.id,
        name: reward.name,
        description: reward.description,
        type: reward.type,
        trigger: reward.trigger,
        conditions: reward.conditions,
        rewardValue: reward.rewardValue,
        isActive: reward.isActive,
        isLimited: reward.isLimited,
        limitedQuantity: reward.limitedQuantity,
        timesAwarded: reward.timesAwarded,
        startDate: reward.startDate,
        endDate: reward.endDate,
        createdAt: reward.createdAt,
        updatedAt: reward.updatedAt,
    })) as RewardResponseDto[];
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

    // Check if the user already has this active reward (optional, depending on business rules)
    const existingUserReward = await this.userRewardRepository.findOne({
        where: { userId: user.id, rewardId: reward.id, status: RewardStatus.ACTIVE },
    });
    if (existingUserReward) {
        // Depending on requirements, you might throw an error or return the existing one
        console.warn(`User ${userId} already has active reward ${rewardId}.`);
        // return this.mapUserRewardToDto(existingUserReward); // Option to return existing
    }


    // Create a new UserReward entry
    const userReward = this.userRewardRepository.create({
      userId: user.id,
      rewardId: reward.id,
      status: RewardStatus.ACTIVE,
      dateAwarded: new Date(),
      // Calculate expiresAt based on reward.expirationDays
      expiresAt: reward.expirationDays ? new Date(Date.now() + reward.expirationDays * 24 * 60 * 60 * 1000) : null,
      // Add initial metadata if needed
      metadata: {}, // Initialize metadata as an empty object
    });

    // Save the UserReward entry
    const savedUserReward = await this.userRewardRepository.save(userReward);

    // Update user's points using GamificationService if the reward grants points
    if (reward.type === RewardType.POINTS && reward.rewardValue && reward.rewardValue.value > 0) {
         // If the reward type is points, award the value specified in rewardValue
         await this.gamificationService.awardPoints(
            userId,
            reward.rewardValue.value, // Awarding the points value from rewardValue
            'reward_awarded', // Tipo de actividad
            `Recompensa otorgada: ${reward.name}` // Descripción
        );
    }


    // Map saved UserReward to UserRewardDto
    console.log(`Awarded reward ${rewardId} to user ${userId}.`);
    return {
      userId: savedUserReward.userId,
      rewardId: savedUserReward.rewardId,
      status: savedUserReward.status,
      dateAwarded: savedUserReward.dateAwarded,
      createdAt: savedUserReward.createdAt,
      consumedAt: savedUserReward.consumedAt,
      expiresAt: savedUserReward.expiresAt,
      metadata: savedUserReward.metadata,
    } as UserRewardDto;
  }

  async getUserRewards(userId: string, filters: UserRewardFilterDto): Promise<UserRewardDto[]> {
    // Implementación básica: encontrar UserRewards para un usuario con filtros
    const queryBuilder = this.userRewardRepository.createQueryBuilder('userReward');

    queryBuilder.where('userReward.userId = :userId', { userId });

    if (filters.status) {
        queryBuilder.andWhere('userReward.status = :status', { status: filters.status });
    }
    // TODO: Add more filter conditions as needed (e.g., date ranges, reward type by joining)

    const userRewards = await queryBuilder.getMany();

    // Map userRewards to UserRewardDto[]
    return userRewards.map(userReward => ({
        userId: userReward.userId,
        rewardId: userReward.rewardId,
        status: userReward.status,
        dateAwarded: userReward.dateAwarded,
        createdAt: userReward.createdAt,
        consumedAt: userReward.consumedAt,
        expiresAt: userReward.expiresAt,
        metadata: userReward.metadata,
    })) as UserRewardDto[];
  }

  async consumeReward(userId: string, userRewardId: string): Promise<UserRewardDto> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find the specific UserReward entry
      const userReward = await queryRunner.manager.findOne(UserReward, { // Use queryRunner.manager
          where: { userId, rewardId: userRewardId }, // Find by user ID and UserReward ID (using rewardId as the identifier)
          relations: ['reward'], // Load the associated reward to check its type/properties
      });

      if (!userReward) {
        throw new NotFoundException(`User reward with ID ${userRewardId} not found for user ${userId}`);
      }

      if (userReward.status === RewardStatus.CONSUMED) {
          throw new BadRequestException("Reward already consumed");
      }

      if (userReward.status === RewardStatus.EXPIRED || (userReward.expiresAt && userReward.expiresAt < new Date())) {
           // Also check if expiresAt is in the past even if status is not EXPIRED yet
          userReward.status = RewardStatus.EXPIRED; // Update status if expired
          await queryRunner.manager.save(userReward); // Use queryRunner.manager.save // Save the status update
          throw new BadRequestException("Reward has expired");
      }

      // Update status and consumedAt date
      userReward.status = RewardStatus.CONSUMED;
      userReward.consumedAt = new Date();

      // Initialize additionalData if it doesn't exist
      if (!userReward.metadata) {
          userReward.metadata = {};
      }
      if (!userReward.metadata.additionalData) {
          userReward.metadata.additionalData = {};
      }


      // Implement logic based on reward type (e.g., apply discount, unlock content)
      console.log(`User ${userId} consuming reward ${userReward.rewardId} (UserReward ID: ${userRewardId}). Type: ${userReward.reward.type}`);
      switch (userReward.reward.type) {
          case RewardType.POINTS:
              // Points rewards are typically awarded upon receiving, not consumed later.
              // This case might not be necessary depending on how points rewards are handled.
              console.warn(`Attempted to consume a points reward (UserReward ID: ${userRewardId}). Points rewards are usually awarded directly.`);
              break;
          case RewardType.DISCOUNT:
              // Logic to apply discount (e.g., generate a discount code, update user profile)
              // For now, just log and update metadata
              userReward.metadata.usageCount = (userReward.metadata.usageCount || 0) + 1;
              console.log(`Applied discount: ${(userReward.reward as any).rewardValue.value}%`);
              break;
          case RewardType.EXCLUSIVE_CONTENT:
          case RewardType.CONTENT:
              // Logic to unlock content (e.g., update user's unlocked content list)
              userReward.metadata.additionalData.unlockedAt = userReward.consumedAt;
              console.log(`Unlocked content ID: ${(userReward.reward as any).rewardValue.value}`);
              break;
          case RewardType.CUSTOMIZATION:
              // Logic to apply customization (e.g., update user profile with title, avatar, etc.)
               userReward.metadata.additionalData.appliedAt = userReward.consumedAt;
               console.log(`Applied customization: ${JSON.stringify((userReward.reward as any).rewardValue.value)}`);
              break;
          case RewardType.CULTURAL:
              // Logic for cultural rewards (e.g., grant access to an event, update participation status)
               userReward.metadata.additionalData.participationDate = userReward.consumedAt;
               console.log(`Participated in cultural event: ${JSON.stringify((userReward.reward as any).rewardValue.value)}`);
              break;
          case RewardType.EXPERIENCE:
              // Logic to apply experience multiplier (e.g., start a timer, update user's active effects)
               userReward.metadata.additionalData.activatedAt = userReward.consumedAt;
               console.log(`Activated experience multiplier: ${(userReward.reward as any).rewardValue.value.multiplier}x for ${(userReward.reward as any).rewardValue.value.durationHours} hours`);
              break;
          case RewardType.BADGE:
          case RewardType.ACHIEVEMENT:
              // Badges and achievements are typically awarded, not consumed later.
              // This case might not be necessary depending on how these rewards are handled.
               console.warn(`Attempted to consume a badge or achievement reward (UserReward ID: ${userRewardId}). These are usually awarded directly.`);
              break;
          default:
              console.warn(`Unknown reward type "${userReward.reward.type}" for consumption (UserReward ID: ${userRewardId}).`);
              break;
      }


      const savedUserReward = await queryRunner.manager.save(userReward); // Use queryRunner.manager.save

      await queryRunner.commitTransaction();

      // TODO: Map saved UserReward to UserRewardDto
       return {
        userId: savedUserReward.userId,
        rewardId: savedUserReward.rewardId,
        status: savedUserReward.status,
        dateAwarded: savedUserReward.dateAwarded,
        createdAt: savedUserReward.createdAt,
        consumedAt: savedUserReward.consumedAt,
        expiresAt: savedUserReward.expiresAt,
        metadata: savedUserReward.metadata,
      } as UserRewardDto;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async checkAndUpdateRewardStatus(userId: string, userRewardId: string): Promise<UserRewardDto> {
    // Find the specific UserReward entry
    const userReward = await this.userRewardRepository.findOne({
        where: { userId, rewardId: userRewardId }, // Find by user ID and Reward ID
    });

    if (!userReward) {
      throw new NotFoundException(`User reward with ID ${userRewardId} not found for user ${userId}`);
    }

    // Check if the reward is active and has an expiration date in the past
    if (userReward.status === RewardStatus.ACTIVE && userReward.expiresAt && userReward.expiresAt < new Date()) {
        userReward.status = RewardStatus.EXPIRED;
        const savedUserReward = await this.userRewardRepository.save(userReward);
        console.log(`User reward ${userRewardId} for user ${userId} has expired.`);
         // Map saved UserReward to UserRewardDto
         return {
            userId: savedUserReward.userId,
            rewardId: savedUserReward.rewardId,
            status: savedUserReward.status,
            dateAwarded: savedUserReward.dateAwarded,
            createdAt: savedUserReward.createdAt,
            consumedAt: savedUserReward.consumedAt,
            expiresAt: savedUserReward.expiresAt,
            metadata: userReward.metadata, // Use userReward.metadata directly
        } as UserRewardDto;
    }

    // If not expired or already in a final state (CONSUMED, EXPIRED), return the current state
     // Map userReward to UserRewardDto
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

  // Helper method to map UserReward entity to UserRewardDto
  private mapUserRewardToDto(userReward: UserReward): UserRewardDto {
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
}
