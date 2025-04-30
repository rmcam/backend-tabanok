import { Test, TestingModule } from '@nestjs/testing';
import { RewardController } from './reward.controller';
import { RewardService } from '../services/reward.service';
import { CreateRewardDto, RewardFilterDto, RewardResponseDto, UserRewardFilterDto, RewardConditionDto, RewardValueDto } from '../dto/reward.dto'; // Importar DTOs anidados
import { UserRewardDto } from '../dto/user-reward.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { UserRole } from '../../../auth/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { RewardType, RewardTrigger } from '../../../common/enums/reward.enum'; // Importar enums de reward
import { RewardStatus } from '../entities/user-reward.entity'; // Importar enum de user-reward

describe('RewardController', () => {
  let controller: RewardController;
  let service: RewardService;

  const mockRewardService = {
    createReward: jest.fn(),
    getAvailableRewards: jest.fn(),
    awardRewardToUser: jest.fn(),
    getUserRewards: jest.fn(),
    consumeReward: jest.fn(),
    checkAndUpdateRewardStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RewardController],
      providers: [
        {
          provide: RewardService,
          useValue: mockRewardService,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<RewardController>(RewardController);
    service = module.get<RewardService>(RewardService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createReward', () => {
    it('should create a reward', async () => {
      const createRewardDto: CreateRewardDto = {
        name: 'Test Reward',
        description: 'Test Description',
        type: RewardType.POINTS, // Usar enum
        trigger: RewardTrigger.LESSON_COMPLETION, // Corregido: Usar un valor válido del enum
        conditions: [], // Usar RewardConditionDto[]
        rewardValue: { type: 'points', value: 100 }, // Usar RewardValueDto
        // Propiedades opcionales
        isLimited: false,
        limitedQuantity: undefined,
        startDate: undefined,
        endDate: undefined,
      };
      const expectedReward: RewardResponseDto = {
        id: 'some-uuid',
        name: createRewardDto.name,
        description: createRewardDto.description,
        type: createRewardDto.type,
        trigger: createRewardDto.trigger,
        conditions: createRewardDto.conditions,
        rewardValue: createRewardDto.rewardValue,
        isActive: true, // Propiedad de RewardResponseDto
        isLimited: createRewardDto.isLimited || false, // Propiedad de RewardResponseDto
        limitedQuantity: createRewardDto.limitedQuantity, // Propiedad de RewardResponseDto
        timesAwarded: 0, // Propiedad de RewardResponseDto
        startDate: createRewardDto.startDate, // Propiedad de RewardResponseDto
        endDate: createRewardDto.endDate, // Propiedad de RewardResponseDto
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRewardService.createReward.mockResolvedValue(expectedReward);

      const result = await controller.createReward(createRewardDto);

      expect(result).toEqual(expectedReward);
      expect(mockRewardService.createReward).toHaveBeenCalledWith(createRewardDto);
    });
  });

  describe('getAvailableRewards', () => {
    it('should return an array of available rewards', async () => {
      const filters: RewardFilterDto = { type: RewardType.POINTS }; // Usar enum
      const expectedRewards: RewardResponseDto[] = [
        { id: 'r1', name: 'Reward 1', description: 'Desc 1', type: RewardType.POINTS, trigger: RewardTrigger.LESSON_COMPLETION, conditions: [], rewardValue: { type: 'points', value: 10 }, isActive: true, isLimited: false, timesAwarded: 0, createdAt: new Date(), updatedAt: new Date() }, // Usar enums y estructura de RewardResponseDto, corregir trigger
        { id: 'r2', name: 'Reward 2', description: 'Desc 2', type: RewardType.BADGE, trigger: RewardTrigger.LEVEL_UP, conditions: [], rewardValue: { type: 'badge', value: { id: 'b1', name: 'Badge 1' } }, isActive: true, isLimited: false, timesAwarded: 0, createdAt: new Date(), updatedAt: new Date() }, // Usar enums y estructura de RewardResponseDto, corregir trigger
      ];

      mockRewardService.getAvailableRewards.mockResolvedValue(expectedRewards);

      const result = await controller.getAvailableRewards(filters);

      expect(result).toEqual(expectedRewards);
      expect(mockRewardService.getAvailableRewards).toHaveBeenCalledWith(filters);
    });
  });

  describe('awardRewardToUser', () => {
    it('should award a reward to a user', async () => {
      const userId = 'test-user-id';
      const rewardId = 'test-reward-id';
      const expectedUserReward: UserRewardDto = {
        userId,
        rewardId,
        status: RewardStatus.ACTIVE, // Corregido: Usar un valor válido del enum
        metadata: {},
        consumedAt: null,
        expiresAt: null,
        dateAwarded: new Date(),
        createdAt: new Date(),
      };

      mockRewardService.awardRewardToUser.mockResolvedValue(expectedUserReward);

      const result = await controller.awardRewardToUser(userId, rewardId);

      expect(result).toEqual(expectedUserReward);
      expect(mockRewardService.awardRewardToUser).toHaveBeenCalledWith(userId, rewardId);
    });

    it('should throw NotFoundException if reward or user not found', async () => {
        const userId = 'non-existent-user';
        const rewardId = 'non-existent-reward';

        mockRewardService.awardRewardToUser.mockRejectedValue(new NotFoundException());

        await expect(controller.awardRewardToUser(userId, rewardId)).rejects.toThrow(NotFoundException);
        expect(mockRewardService.awardRewardToUser).toHaveBeenCalledWith(userId, rewardId);
    });
  });

  describe('getUserRewards', () => {
    it('should return user rewards', async () => {
      const userId = 'test-user-id';
      const filters: UserRewardFilterDto = { status: RewardStatus.ACTIVE }; // Corregido: Usar un valor válido del enum
      const mockUserRewards = [
        { userId, rewardId: 'r1', status: RewardStatus.ACTIVE, metadata: {}, consumedAt: null, expiresAt: null, dateAwarded: new Date(), createdAt: new Date() }, // Usar enum, corregir status
        { userId, rewardId: 'r2', status: RewardStatus.CONSUMED, metadata: {}, consumedAt: new Date(), expiresAt: null, dateAwarded: new Date(), createdAt: new Date() }, // Usar enum
      ];
      const expectedUserRewards: UserRewardDto[] = mockUserRewards.map(userReward => ({
        userId: userReward.userId,
        rewardId: userReward.rewardId,
        status: userReward.status,
        metadata: userReward.metadata,
        consumedAt: userReward.consumedAt,
        expiresAt: userReward.expiresAt,
        dateAwarded: userReward.dateAwarded,
        createdAt: userReward.createdAt
      }));

      mockRewardService.getUserRewards.mockResolvedValue(mockUserRewards);

      const result = await controller.getUserRewards(userId, filters);

      expect(result).toEqual(expectedUserRewards);
      expect(mockRewardService.getUserRewards).toHaveBeenCalledWith(userId, filters);
    });

    it('should throw NotFoundException if user not found', async () => {
        const userId = 'non-existent-user';
        const filters: UserRewardFilterDto = {};

        mockRewardService.getUserRewards.mockRejectedValue(new NotFoundException());

        await expect(controller.getUserRewards(userId, filters)).rejects.toThrow(NotFoundException);
        expect(mockRewardService.getUserRewards).toHaveBeenCalledWith(userId, filters);
    });
  });

  describe('consumeReward', () => {
    it('should consume a user reward', async () => {
      const userId = 'test-user-id';
      const rewardId = 'test-reward-id';
      const expectedUserReward: UserRewardDto = {
        userId,
        rewardId,
        status: RewardStatus.CONSUMED, // Usar enum
        metadata: {},
        consumedAt: new Date(),
        expiresAt: null,
        dateAwarded: new Date(),
        createdAt: new Date(),
      };

      mockRewardService.consumeReward.mockResolvedValue(expectedUserReward);

      const result = await controller.consumeReward(userId, rewardId);

      expect(result).toEqual(expectedUserReward);
      expect(mockRewardService.consumeReward).toHaveBeenCalledWith(userId, rewardId);
    });

    it('should throw NotFoundException if user reward not found', async () => {
        const userId = 'test-user-id';
        const rewardId = 'non-existent-reward';

        mockRewardService.consumeReward.mockRejectedValue(new NotFoundException());

        await expect(controller.consumeReward(userId, rewardId)).rejects.toThrow(NotFoundException);
        expect(mockRewardService.consumeReward).toHaveBeenCalledWith(userId, rewardId);
    });
  });

  describe('checkRewardStatus', () => {
    it('should check and update reward status', async () => {
      const userId = 'test-user-id';
      const rewardId = 'test-reward-id';
      const expectedUserReward: UserRewardDto = {
        userId,
        rewardId,
        status: RewardStatus.ACTIVE, // Usar enum
        metadata: {},
        consumedAt: null,
        expiresAt: null,
        dateAwarded: new Date(),
        createdAt: new Date(),
      };

      mockRewardService.checkAndUpdateRewardStatus.mockResolvedValue(expectedUserReward);

      const result = await controller.checkRewardStatus(userId, rewardId);

      expect(result).toEqual(expectedUserReward);
      expect(mockRewardService.checkAndUpdateRewardStatus).toHaveBeenCalledWith(userId, rewardId);
    });

    it('should throw NotFoundException if user reward not found', async () => {
        const userId = 'test-user-id';
        const rewardId = 'non-existent-reward';

        mockRewardService.checkAndUpdateRewardStatus.mockRejectedValue(new NotFoundException());

        await expect(controller.checkRewardStatus(userId, rewardId)).rejects.toThrow(NotFoundException);
        expect(mockRewardService.checkAndUpdateRewardStatus).toHaveBeenCalledWith(userId, rewardId);
    });
  });
});
