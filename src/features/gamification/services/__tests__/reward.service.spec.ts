import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../../auth/entities/user.entity';
import { NotificationService } from '../../../notifications/services/notification.service';
import { Reward, RewardType, RewardTrigger } from '../../entities/reward.entity';
import { UserLevel } from '../../entities/user-level.entity';
import { RewardStatus, UserReward } from '../../entities/user-reward.entity';
import { RewardService } from '../reward.service';

describe('RewardService', () => {
  let service: RewardService;
  let rewardRepository: Repository<Reward>;
  let userRewardRepository: Repository<UserReward>;
  let userLevelRepository: Repository<UserLevel>;
  let userRepository: Repository<User>;
  let notificationService: NotificationService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    culturalPoints: 100,
  } as User;

  const mockReward = {
    id: '1',
    name: 'Puntos por completar lección',
    description: 'Recompensa por completar una lección',
    type: RewardType.POINTS,
    trigger: RewardTrigger.LESSON_COMPLETION,
    conditions: [
      {
        type: 'lesson_completed',
        value: 1,
        description: 'Completar al menos 1 lección',
      },
    ],
    rewardValue: {
      type: 'points',
      value: 100,
    },
    isActive: true,
    isLimited: false,
    timesAwarded: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Reward;

    const mockUserReward: Partial<UserReward> = {
        userId: '1',
        rewardId: '1',
        status: RewardStatus.ACTIVE,
        user: mockUser,
        reward: mockReward as any, // Temporal hasta verificar estructura de Reward
        dateAwarded: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        metadata: {
            usageCount: 0,
            additionalData: {
                quizScore: 85,
                attempts: 1
            }
        },
        createdAt: new Date()
    };

  const mockUserLevel: Partial<UserLevel> = {
    id: '1',
    userId: '1',
    user: mockUser,
    currentLevel: 5,
    experiencePoints: 2500,
    experienceToNextLevel: 3000,
    consistencyStreak: {
      current: 5,
      longest: 10,
      lastActivityDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    levelHistory: [
      {
        level: 4,
        achievedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        bonusesReceived: []
      }
    ],
    streakHistory: [],
    activityLog: [],
    bonuses: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const mockNotificationService = {
    notifyRewardEarned: jest.fn().mockResolvedValue(undefined),
    notifyStreakMilestone: jest.fn().mockResolvedValue(undefined),
    createNotification: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardService,
        {
          provide: getRepositoryToken(Reward),
          useValue: {
            create: jest.fn().mockReturnValue(mockReward),
            save: jest.fn().mockResolvedValue(mockReward),
            findOne: jest.fn().mockResolvedValue(mockReward),
            find: jest.fn().mockResolvedValue([mockReward]),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([mockReward]),
            })),
          },
        },
        {
          provide: getRepositoryToken(UserReward),
          useValue: {
            create: jest.fn().mockReturnValue(mockUserReward),
            save: jest.fn().mockResolvedValue(mockUserReward),
            findOne: jest.fn().mockResolvedValue(mockUserReward),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([mockUserReward]),
            })),
          },
        },
        {
          provide: getRepositoryToken(UserLevel),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUserLevel),
            save: jest.fn().mockResolvedValue(mockUserLevel),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUser),
            save: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<RewardService>(RewardService);
    rewardRepository = module.get<Repository<Reward>>(
      getRepositoryToken(Reward),
    );
    userRewardRepository = module.get<Repository<UserReward>>(
      getRepositoryToken(UserReward),
    );
    userLevelRepository = module.get<Repository<UserLevel>>(
      getRepositoryToken(UserLevel),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    notificationService = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReward', () => {
    it('should create a new reward', async () => {
      const rewardData = {
        name: 'Puntos por completar lección',
        description: 'Recompensa por completar una lección',
        type: RewardType.POINTS,
        trigger: RewardTrigger.LESSON_COMPLETION,
        conditions: [
          {
            type: 'lesson_completed',
            value: 1,
            description: 'Completar al menos 1 lección',
          },
        ],
        rewardValue: {
          type: 'points',
          value: 100,
        },
      };

      const result = await service.createReward(rewardData);
      expect(result).toEqual(mockReward);
      expect(rewardRepository.create).toHaveBeenCalledWith(rewardData);
      expect(rewardRepository.save).toHaveBeenCalled();
    });
  });

  describe('getAvailableRewards', () => {
    it('should return all active rewards when no filters are provided', async () => {
      const result = await service.getAvailableRewards();
      expect(result).toEqual([mockReward]);
    });

    it('should apply filters when provided', async () => {
      const filters = {
        type: RewardType.POINTS,
        trigger: RewardTrigger.LESSON_COMPLETION,
      };
      const result = await service.getAvailableRewards(filters);
      expect(result).toEqual([mockReward]);
    });
  });

  describe('awardRewardToUser', () => {
    it('should award a reward to a user', async () => {
      const result = await service.awardRewardToUser('1', '1');
      expect(result).toEqual(mockUserReward);
      expect(userRewardRepository.create).toHaveBeenCalled();
      expect(userRewardRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await expect(service.awardRewardToUser('999', '1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when reward is not found', async () => {
      jest.spyOn(rewardRepository, 'findOne').mockResolvedValue(null);
      await expect(service.awardRewardToUser('1', '999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when reward is not active', async () => {
      jest.spyOn(rewardRepository, 'findOne').mockResolvedValue({
        ...mockReward,
        isActive: false,
      } as Reward);
      await expect(service.awardRewardToUser('1', '1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getUserRewards', () => {
    it('should return user rewards', async () => {
      const result = await service.getUserRewards('1');
      expect(result).toEqual([mockUserReward]);
    });

    it('should filter by status when provided', async () => {
      const result = await service.getUserRewards('1');
      expect(result).toEqual([mockUserReward]);
    });
  });

  describe('checkAndUpdateRewardStatus', () => {
    it('should return reward status', async () => {
      const result = await service.checkAndUpdateRewardStatus('1', '1');
      expect(result).toEqual(mockUserReward);
    });

    it('should throw NotFoundException when user reward is not found', async () => {
      jest.spyOn(userRewardRepository, 'findOne').mockResolvedValue(null);
      await expect(
        service.checkAndUpdateRewardStatus('999', '1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('consumeReward', () => {
    it('should consume a reward', async () => {
      const result = await service.consumeReward('1', '1');
      expect(result.status).toBe(RewardStatus.CONSUMED);
      expect(result.consumedAt).toBeDefined();
    });

    it('should throw BadRequestException when reward is not active', async () => {
      jest.spyOn(userRewardRepository, 'findOne').mockResolvedValue({
        ...mockUserReward,
        status: RewardStatus.EXPIRED,
      } as UserReward);
      await expect(service.consumeReward('1', '1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('checkConsistencyRewards', () => {
    it('should update consistency streak', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const mockUserLevelWithStreak = {
        ...mockUserLevel,
        consistencyStreak: {
          current: 5,
          longest: 10,
          lastActivityDate: yesterday,
          streakHistory: [],
        },
      };

      jest
        .spyOn(userLevelRepository, 'findOne')
        .mockResolvedValue(mockUserLevelWithStreak as UserLevel);
      await service.checkConsistencyRewards('1');
      expect(userLevelRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user level is not found', async () => {
      jest.spyOn(userLevelRepository, 'findOne').mockResolvedValue(null);
      await expect(service.checkConsistencyRewards('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
