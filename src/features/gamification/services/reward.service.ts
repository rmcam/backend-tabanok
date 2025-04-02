
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from '../../notifications/services/notification.service';
import { Reward } from '../entities/reward.entity';
import { RewardTrigger, RewardType } from '../../../common/enums/reward.enum';
import { User } from '../../../auth/entities/user.entity'; // Ruta corregida
import { RewardResponseDto } from '../dto/reward-response.dto';
import { UserRewardDto } from '../dto/user-reward.dto';
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
        private notificationService: NotificationService
    ) { }

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
            updatedAt: reward.updatedAt
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
                ...(filters?.trigger && { trigger: filters.trigger })
            }
        });
        return rewards.map(reward => this.mapRewardToDto(reward));
    }

    async awardRewardToUser(userId: string, rewardId: string): Promise<UserRewardDto> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['progress', 'userRewards', 'achievements']
        });
        const reward = await this.rewardRepository.findOne({ where: { id: rewardId } });

        if (!user || !reward) {
            throw new NotFoundException('Usuario o recompensa no encontrada');
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
                additionalData: {}
            }
        });

        const savedReward = await this.userRewardRepository.save(userReward);
        await this.applyRewardEffect(user, reward);

        return this.mapUserRewardToDto({
            ...savedReward,
            user,
            reward
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
                status: RewardStatus.ACTIVE
            },
            relations: ['reward']
        });
    }

    async checkAndUpdateRewardStatus(userId: string, rewardId: string): Promise<UserRewardDto> {
        const userReward = await this.userRewardRepository.findOne({
            where: {
                userId: userId,
                rewardId: rewardId
            },
            relations: ['user', 'reward']
        });

        if (!userReward) {
            throw new NotFoundException(`UserReward not found for user ${userId} and reward ${rewardId}`);
        }

        // Aquí tu lógica para actualizar el estado

        const savedReward = await this.userRewardRepository.save(userReward);
        return this.mapUserRewardToDto(savedReward);
    }

    private mapUserRewardToDto(userReward: UserReward & { user: User; reward: Reward }): UserRewardDto {
        return {
            userId: userReward.userId,
            rewardId: userReward.rewardId,
            status: userReward.status,
            metadata: userReward.metadata,
            consumedAt: userReward.consumedAt,
            expiresAt: userReward.expiresAt,
            dateAwarded: userReward.dateAwarded,
            createdAt: userReward.createdAt
        };
    }

    async consumeReward(userId: string, rewardId: string): Promise<UserRewardDto> {
        const userReward = await this.userRewardRepository.findOne({
            where: {
                userId: userId,
                rewardId: rewardId,
                status: RewardStatus.ACTIVE
            }
        });

        if (!userReward) {
            throw new NotFoundException(`Recompensa activa no encontrada para el usuario ${userId} y recompensa ${rewardId}`);
        }

        userReward.status = RewardStatus.CONSUMED;
        userReward.consumedAt = new Date();
        userReward.metadata = {
            ...userReward.metadata,
            usageCount: (userReward.metadata?.usageCount || 0) + 1,
            lastUsed: new Date()
        };

        const savedReward = await this.userRewardRepository.save(userReward);
        return this.mapUserRewardToDto(savedReward);
    }

    async checkConsistencyRewards(userId: string): Promise<void> {
        const userLevel = await this.userLevelRepository.findOne({
            where: { userId },
            relations: ['consistencyStreak']
        });

        if (!userLevel) {
            throw new NotFoundException(`UserLevel not found for user ${userId}`);
        }

        const now = new Date();
        const lastActivity = new Date(userLevel.consistencyStreak.lastActivityDate);

        if (this.isConsecutiveDay(lastActivity, now)) {
            userLevel.consistencyStreak.current += 1;
            if (userLevel.consistencyStreak.current > userLevel.consistencyStreak.longest) {
                userLevel.consistencyStreak.longest = userLevel.consistencyStreak.current;
                await this.notificationService.notifyStreakMilestone(userId, userLevel.consistencyStreak.current);
            }

            // Otorgar recompensas por consistencia
            await this.checkAndAwardConsistencyRewards(userId, userLevel.consistencyStreak.current);
        } else {
            // Reiniciar la racha si se perdió la consistencia
            if (userLevel.consistencyStreak.current > 0) {
                userLevel.streakHistory.push({
                    startDate: new Date(lastActivity.setDate(lastActivity.getDate() - userLevel.consistencyStreak.current + 1)),
                    endDate: lastActivity,
                    duration: userLevel.consistencyStreak.current
                });
            }
            userLevel.consistencyStreak.current = 1;
        }

        userLevel.consistencyStreak.lastActivityDate = now;
        await this.userLevelRepository.save(userLevel);
    }

    private isConsecutiveDay(lastActivity: Date, currentActivity: Date): boolean {
        const lastDate = new Date(lastActivity.setHours(0, 0, 0, 0));
        const currentDate = new Date(currentActivity.setHours(0, 0, 0, 0));
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 1;
    }

    private async checkAndAwardConsistencyRewards(userId: string, streakDays: number): Promise<void> {
        // Buscar recompensas por consistencia que apliquen al streak actual
        const consistencyRewards = await this.rewardRepository.find({
            where: {
                trigger: RewardTrigger.STREAK,
                isActive: true,
                conditions: {
                    type: 'streak_days',
                    value: streakDays
                }
            }
        });

        // Otorgar las recompensas que correspondan
        for (const reward of consistencyRewards) {
            try {
                await this.awardRewardToUser(userId, reward.id);
            } catch (error) {
                // Manejar el error pero continuar con las demás recompensas
                console.error(`Error al otorgar recompensa por consistencia: ${error.message}`);
            }
        }
    }

    async findByUser(userId: string): Promise<UserReward[]> {
        return await this.userRewardRepository.find({
            where: {
                userId,
                status: RewardStatus.ACTIVE
            },
            relations: ['user', 'reward']
        });
    }
}
