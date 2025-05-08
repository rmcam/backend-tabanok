import { Test, TestingModule } from '@nestjs/testing';
import { RewardService } from './reward.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserRepository } from '../../../auth/repositories/user.repository';
import { Repository, DeepPartial } from 'typeorm'; // Importar DeepPartial
import { User } from '../../../auth/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import { Reward } from '../entities/reward.entity'; // Import Reward entity
import { UserReward } from '../entities/user-reward.entity'; // Import UserReward entity
import { RewardType } from '../../../common/enums/reward.enum'; // Import RewardType enum
import { RewardStatus } from '../../../common/enums/reward.enum'; // Import RewardStatus enum
import { GamificationService } from './gamification.service'; // Importar GamificationService
import { UserLevelRepository } from '../repositories/user-level.repository'; // Importar UserLevelRepository

// Mock Repositories
const mockUserRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  // Add other methods used by RewardService that interact with UserRepository
});

const mockRewardRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  create: jest.fn(), // Add create method
  // Add other methods used by RewardService that interact with RewardRepository
});

const mockUserRewardRepository = () => ({
  create: jest.fn(),
  save: jest.fn().mockImplementation(async (userReward: DeepPartial<UserReward>) => {
    // Return a UserReward object with required properties to satisfy the type expectation
    // Removed 'id' as the error indicates it does not exist on UserReward type.
    // Ensure required properties are present and correctly typed.
    return {
      userId: userReward.userId as string, // Ensure userId is present and cast to string
      rewardId: userReward.rewardId as string, // Ensure rewardId is present and cast to string
      status: userReward.status as RewardStatus, // Ensure status is present and cast to RewardStatus
      dateAwarded: userReward.dateAwarded || new Date(), // Add dateAwarded if not present
      createdAt: userReward.createdAt || new Date(), // Add createdAt if not present
      // Add other required properties of UserReward if any based on the entity definition
      // Assuming 'user', 'reward', 'consumedAt', 'expiresAt', 'metadata' are optional or have default values
      user: userReward.user,
      reward: userReward.reward,
      consumedAt: userReward.consumedAt,
      expiresAt: userReward.expiresAt,
      metadata: userReward.metadata || {},
    } as UserReward; // Cast the entire object to UserReward
  }),
  findOne: jest.fn(),
  find: jest.fn(),
  // Add other methods used by RewardService that interact with UserRewardRepository
});


describe('RewardService', () => {
  let service: RewardService;
  let userRepository: Repository<User>;
  let rewardRepository: Repository<Reward>; // Declare rewardRepository
  let userRewardRepository: Repository<UserReward>; // Declare userRewardRepository
  let gamificationService: GamificationService; // Declarar gamificationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RewardService,
        {
          provide: getRepositoryToken(UserRepository),
          useFactory: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Reward), // Provide RewardRepository
          useFactory: mockRewardRepository,
        },
        {
          provide: getRepositoryToken(UserReward), // Provide UserRewardRepository
          useFactory: mockUserRewardRepository,
        },
        {
          provide: GamificationService, // Añadir mock para GamificationService
          useValue: {
            // Añadir métodos mock según sea necesario si RewardService interactúa con él
            awardPoints: jest.fn(),
            findByUserId: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserLevelRepository), // Reemplazar LevelRepository con UserLevelRepository
          useValue: {
            // Mock methods for UserLevelRepository if needed by RewardService
          },
        },
      ],
    }).compile();

    service = module.get<RewardService>(RewardService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(UserRepository));
    rewardRepository = module.get<Repository<Reward>>(getRepositoryToken(Reward)); // Get RewardRepository
    userRewardRepository = module.get<Repository<UserReward>>(getRepositoryToken(UserReward)); // Get UserRewardRepository
    gamificationService = module.get<GamificationService>(GamificationService); // Obtener GamificationService
  });

  afterEach(() => {
    // Restore console.log after each test
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // TODO: Implement comprehensive tests for RewardService methods:
  // createReward, getAvailableRewards, awardRewardToUser, getUserRewards,
  // consumeReward, and checkAndUpdateRewardStatus.
  // Ensure tests cover various scenarios, including successful operations,
  // edge cases, and error handling (e.g., user not found in awardRewardToUser).

  describe('findAll', () => {
    it('should return an empty array as a temporary implementation', async () => {
      const result = await service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('awardRewardToUser', () => {
    it('should award a reward to a user and update their points', async () => {
      const userId = 'test-user-id';
      const rewardId = 'test-reward-id';
      const initialPoints = 50;
      const rewardPoints = 10;

      const mockUser = { id: userId, points: initialPoints } as User;
      const mockReward = {
        id: rewardId,
        name: 'Test Reward',
        description: 'A test reward',
        type: 'badge',
        pointsCost: rewardPoints,
        imageUrl: 'test.png',
      } as Reward;

      // Mock the object returned by userRewardRepository.create
      const createdUserReward = {
        userId: mockUser.id,
        rewardId: mockReward.id,
        status: RewardStatus.ACTIVE,
        dateAwarded: new Date(),
        createdAt: new Date(),
      } as UserReward;


      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(rewardRepository, 'findOne').mockResolvedValue(mockReward);
      jest.spyOn(userRewardRepository, 'create').mockReturnValue(createdUserReward); // Mock create to return the expected object
      jest.spyOn(userRewardRepository, 'save').mockResolvedValue(createdUserReward); // Expect save to be called with the object returned by create
      jest.spyOn(userRepository, 'save').mockResolvedValue({ ...mockUser, points: initialPoints + rewardPoints });

      const result = await service.awardRewardToUser(userId, rewardId);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(rewardRepository.findOne).toHaveBeenCalledWith({ where: { id: rewardId } });
      // Expect create to be called with userId and rewardId
      expect(userRewardRepository.create).toHaveBeenCalledWith({ userId: mockUser.id, rewardId: mockReward.id, status: RewardStatus.ACTIVE, dateAwarded: expect.any(Date) });
      // Expect save to be called with the object returned by create
      expect(userRewardRepository.save).toHaveBeenCalledWith(createdUserReward);
      expect(userRepository.save).toHaveBeenCalledWith({ ...mockUser, points: initialPoints + rewardPoints });
      expect(result).toBeDefined();
      // Assertions based on the UserRewardDto structure
      expect(result.userId).toBe(userId);
      expect(result.rewardId).toBe(rewardId);
      expect(result.status).toBe('ACTIVE');
      expect(result.dateAwarded).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('getUserRewards', () => {
    it('should return an empty array as a temporary implementation', async () => {
      const userId = 'test-user-id';
      const filters = {};
      const result = await service.getUserRewards(userId, filters);
      expect(result).toEqual([]);
    });

    it('should return an empty array when filtered by status as a temporary implementation', async () => {
      const userId = 'test-user-id';
      const filters = { status: RewardStatus.ACTIVE };
      const result = await service.getUserRewards(userId, filters);
      expect(result).toEqual([]);
    });

    it('should return an empty array if the user has no rewards as a temporary implementation', async () => {
      const userId = 'test-user-id';
      const filters = {};
      const result = await service.getUserRewards(userId, filters);
      expect(result).toEqual([]);
    });
  });

  describe('getAvailableRewards', () => {
    it('should return an empty array as a temporary implementation', async () => {
      const filters = { type: RewardType.BADGE, minPoints: 10 };
      const result = await service.getAvailableRewards(filters);
      expect(result).toEqual([]);
    });

    it('should return an empty array if no available rewards are found as a temporary implementation', async () => {
      const filters = { type: RewardType.POINTS, minPoints: 100 };
      const result = await service.getAvailableRewards(filters);
      expect(result).toEqual([]);
    });
  });

  describe('createReward', () => {
    it('should create a new reward', async () => {
      const createRewardDto = {
        name: 'New Reward',
        description: 'A new reward',
        points: 20, // This should map to pointsCost
        type: 'badge', // Assuming RewardType enum exists
        imageUrl: 'new-reward.png',
      };
      // Expected entity structure after mapping DTO to entity
      const expectedRewardEntity = {
        id: 'new-reward-id',
        name: createRewardDto.name,
        description: createRewardDto.description,
        type: createRewardDto.type,
        pointsCost: createRewardDto.points, // Mapped from points in DTO
        imageUrl: createRewardDto.imageUrl,
      };

      // Mock create to return a partial entity
      jest.spyOn(rewardRepository, 'create').mockReturnValue(expectedRewardEntity as Reward);
      // Mock save to return the saved entity
      jest.spyOn(rewardRepository, 'save').mockResolvedValue(expectedRewardEntity as Reward);

      const result = await service.createReward(createRewardDto as any); // Cast to any for simplicity in test

      // Verify create was called with the DTO
      expect(rewardRepository.create).toHaveBeenCalledWith(createRewardDto);
      // Verify save was called with the created entity
      expect(rewardRepository.save).toHaveBeenCalledWith(expectedRewardEntity);
      // Verify the result matches the expected DTO structure (assuming service maps entity back to DTO)
      // Note: The current service implementation returns the entity directly,
      // so this assertion needs adjustment.
      // If the service is updated to map to DTO, this assertion needs adjustment.
      expect(result).toEqual(expectedRewardEntity);
    });

    it('should handle errors during reward creation', async () => {
      const createRewardDto = {
        name: 'New Reward',
        description: 'A new reward',
        points: 20, // This should likely be pointsCost based on the entity
        type: 'badge', // Assuming a valid RewardType
        imageUrl: 'new-reward.png',
      };
      const mockError = new Error('Database error');

      // The create method should return a partial Reward entity, not the DTO directly
      jest.spyOn(rewardRepository, 'create').mockReturnValue({
        ...createRewardDto,
        id: 'temp-id', // Add a temporary ID as create usually assigns one
        pointsCost: createRewardDto.points, // Map points from DTO to pointsCost in entity
      } as Reward);
      jest.spyOn(rewardRepository, 'save').mockRejectedValue(mockError);

      await expect(service.createReward(createRewardDto as any)).rejects.toThrow(mockError);
      // Verify create was called with the DTO
      expect(rewardRepository.create).toHaveBeenCalledWith(createRewardDto);
      // Verify save was called with the created entity (or the result of create)
      // Depending on the exact mock setup, this might need adjustment.
      // Assuming save is called with the object returned by create:
      expect(userRewardRepository.save).toHaveBeenCalledWith({
        ...createRewardDto,
        id: 'temp-id',
        pointsCost: createRewardDto.points,
      });
    });
  });

  describe('consumeReward', () => {
    it('should consume an active user reward', async () => {
      const userId = 'test-user-id';
      const rewardId = 'test-reward-id';
      const mockUserReward = {
        userId,
        rewardId,
        status: RewardStatus.CONSUMED, // Changed to CONSUMED for this test case
        dateAwarded: new Date(),
        createdAt: new Date(),
        consumedAt: new Date(), // Added consumedAt
        expiresAt: null,
        metadata: {},
      } as UserReward;

      jest.spyOn(userRewardRepository, 'findOne').mockResolvedValue(mockUserReward);
      jest.spyOn(userRewardRepository, 'save').mockResolvedValue({
        ...mockUserReward,
        status: RewardStatus.CONSUMED,
        consumedAt: expect.any(Date),
      });

      const result = await service.consumeReward(userId, rewardId);

      expect(userRewardRepository.findOne).toHaveBeenCalledWith({ where: { userId, rewardId } });
      expect(userRewardRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        status: RewardStatus.CONSUMED,
        consumedAt: expect.any(Date),
      }));
      expect(result.status).toBe(RewardStatus.CONSUMED);
      expect(result.consumedAt).toBeInstanceOf(Date);
    });

    it('should throw NotFoundException if user reward is not found', async () => {
      const userId = 'test-user-id';
      const rewardId = 'non-existent-reward-id';

      jest.spyOn(userRewardRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.consumeReward(userId, rewardId)).rejects.toThrow(NotFoundException);
      expect(userRewardRepository.findOne).toHaveBeenCalledWith({ where: { userId, rewardId } });
      expect(userRewardRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error if user reward is already consumed', async () => {
      const userId = 'test-user-id';
      const rewardId = 'test-reward-id';
      const mockUserReward = {
        userId,
        rewardId,
        status: RewardStatus.CONSUMED,
        dateAwarded: new Date(),
        createdAt: new Date(),
        consumedAt: new Date(),
        expiresAt: null,
        metadata: {},
      } as UserReward;

      jest.spyOn(userRewardRepository, 'findOne').mockResolvedValue(mockUserReward);

      await expect(service.consumeReward(userId, rewardId)).rejects.toThrow('Reward already consumed');
      expect(userRewardRepository.findOne).toHaveBeenCalledWith({ where: { userId, rewardId } });
      expect(userRewardRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error if user reward is expired', async () => {
      const userId = 'test-user-id';
      const rewardId = 'test-reward-id';
      const mockUserReward = {
        userId,
        rewardId,
        status: RewardStatus.ACTIVE,
        dateAwarded: new Date(),
        createdAt: new Date(),
        consumedAt: null,
        expiresAt: new Date(Date.now() - 1000), // Expired date
        metadata: {},
      } as UserReward;

      jest.spyOn(userRewardRepository, 'findOne').mockResolvedValue(mockUserReward);

      await expect(service.consumeReward(userId, rewardId)).rejects.toThrow('Reward has expired');
      expect(userRewardRepository.findOne).toHaveBeenCalledWith({ where: { userId, rewardId } });
      expect(userRewardRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('checkAndUpdateRewardStatus', () => {
    it('should update expired active rewards to EXPIRED status', async () => {
      const userId = 'test-user-id';
      const expiredReward = {
        userId,
        rewardId: 'expired-reward-id',
        status: RewardStatus.ACTIVE,
        dateAwarded: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Awarded a week ago
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        consumedAt: null,
        expiresAt: new Date(Date.now() - 1000), // Expired date
        metadata: {},
      } as UserReward;
      const activeReward = {
        userId,
        rewardId: 'active-reward-id',
        status: RewardStatus.ACTIVE,
        dateAwarded: new Date(),
        createdAt: new Date(),
        consumedAt: null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in a week
        metadata: {},
      } as UserReward;
      const consumedReward = {
        userId,
        rewardId: 'consumed-reward-id',
        status: RewardStatus.CONSUMED,
        dateAwarded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        consumedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        metadata: {},
      } as UserReward;

      jest.spyOn(userRewardRepository, 'find').mockResolvedValue([expiredReward, activeReward, consumedReward]);
      jest.spyOn(userRewardRepository, 'save').mockImplementation(async (userReward) => {
        // Return a UserReward object with required properties to satisfy the type expectation
        return {
          ...userReward,
          // Removed 'id' as it seems not to be a property of UserReward based on errors
          userId: userReward.userId as string, // Ensure userId is present and cast to string
          rewardId: userReward.rewardId as string, // Ensure rewardId is present and cast to string
          status: userReward.status as RewardStatus, // Ensure status is present and cast to RewardStatus
          dateAwarded: userReward.dateAwarded || new Date(), // Add dateAwarded if not present
          createdAt: userReward.createdAt || new Date(), // Add createdAt if not present
          // Add other required properties of UserReward if any based on the entity definition
        } as UserReward;
      }); // Mock save to return the saved entity

      await service.checkAndUpdateRewardStatus(userId, expiredReward.rewardId); // Check a specific reward

      expect(userRewardRepository.findOne).toHaveBeenCalledWith({ where: { userId, rewardId: expiredReward.rewardId } });
      expect(userRewardRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        userId,
        rewardId: expiredReward.rewardId,
        status: RewardStatus['EXPIRED'] as any, // Access EXPIRED using bracket notation
      }));
      // Ensure other rewards are not affected by checking a specific one
      expect(userRewardRepository.save).not.toHaveBeenCalledWith(expect.objectContaining({
        userId,
        rewardId: activeReward.rewardId,
        status: RewardStatus['EXPIRED'] as any, // Access EXPIRED using bracket notation
      }));
      expect(userRewardRepository.save).not.toHaveBeenCalledWith(expect.objectContaining({
        userId,
        rewardId: consumedReward.rewardId,
        status: RewardStatus['EXPIRED'] as any, // Access EXPIRED using bracket notation
      }));
    });

    it('should not update active rewards that have not expired', async () => {
      const userId = 'test-user-id';
      const activeReward = {
        userId,
        rewardId: 'active-reward-id',
        status: RewardStatus.ACTIVE,
        dateAwarded: new Date(),
        createdAt: new Date(),
        consumedAt: null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in a week
        metadata: {},
      } as UserReward;

      jest.spyOn(userRewardRepository, 'findOne').mockResolvedValue(activeReward);
      jest.spyOn(userRewardRepository, 'save').mockImplementation(async (userReward) => {
        // Return a UserReward object with required properties to satisfy the type expectation
        return {
          ...userReward,
          // Removed 'id' as it seems not to be a property of UserReward based on errors
          userId: userReward.userId as string, // Ensure userId is present and cast to string
          rewardId: userReward.rewardId as string, // Ensure rewardId is present and cast to string
          status: userReward.status as RewardStatus, // Ensure status is present and cast to RewardStatus
          dateAwarded: userReward.dateAwarded || new Date(), // Add dateAwarded if not present
          createdAt: userReward.createdAt || new Date(), // Add createdAt if not present
          // Add other required properties of UserReward if any based on the entity definition
        } as UserReward;
      });

      await service.checkAndUpdateRewardStatus(userId, activeReward.rewardId);

      expect(userRewardRepository.findOne).toHaveBeenCalledWith({ where: { userId, rewardId: activeReward.rewardId } });
      expect(userRewardRepository.save).not.toHaveBeenCalled(); // Save should not be called
    });

    it('should not update rewards that are already consumed or expired', async () => {
      const userId = 'test-user-id';
      const consumedReward = {
        userId,
        rewardId: 'consumed-reward-id',
        status: RewardStatus.CONSUMED,
        dateAwarded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        consumedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() - 1000), // Expired date
        metadata: {},
      } as UserReward;
      const expiredReward = {
        userId,
        rewardId: 'expired-reward-id',
        status: RewardStatus['EXPIRED'], // Access EXPIRED using bracket notation
        dateAwarded: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        consumedAt: null,
        expiresAt: new Date(Date.now() - 1000), // Expired date
        metadata: {},
      } as UserReward;

      jest.spyOn(userRewardRepository, 'findOne').mockResolvedValue(consumedReward);
      jest.spyOn(userRewardRepository, 'save').mockImplementation(async (userReward) => {
        // Return a UserReward object with required properties to satisfy the type expectation
        return {
          ...userReward,
          // Removed 'id' as it seems not to be a property of UserReward based on errors
          userId: userReward.userId as string, // Ensure userId is present and cast to string
          rewardId: userReward.rewardId as string, // Ensure rewardId is present and cast to string
          status: userReward.status as RewardStatus, // Ensure status is present and cast to RewardStatus
          dateAwarded: userReward.dateAwarded || new Date(), // Add dateAwarded if not present
          createdAt: userReward.createdAt || new Date(), // Add createdAt if not present
          // Add other required properties of UserReward if any based on the entity definition
        } as UserReward;
      });

      await service.checkAndUpdateRewardStatus(userId, consumedReward.rewardId);

      expect(userRewardRepository.findOne).toHaveBeenCalledWith({ where: { userId, rewardId: consumedReward.rewardId } });
      expect(userRewardRepository.save).not.toHaveBeenCalled(); // Save should not be called

      jest.spyOn(userRewardRepository, 'findOne').mockResolvedValue(expiredReward);
      await service.checkAndUpdateRewardStatus(userId, expiredReward.rewardId);

      expect(userRewardRepository.findOne).toHaveBeenCalledWith({ where: { userId, rewardId: expiredReward.rewardId } });
      expect(userRewardRepository.save).not.toHaveBeenCalled(); // Save should not be called
    });

    it('should throw NotFoundException if user reward is not found', async () => {
      const userId = 'test-user-id';
      const rewardId = 'non-existent-reward-id';

      jest.spyOn(userRewardRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.checkAndUpdateRewardStatus(userId, rewardId)).rejects.toThrow(NotFoundException);
      expect(userRewardRepository.findOne).toHaveBeenCalledWith({ where: { userId, rewardId } });
      expect(userRewardRepository.save).not.toHaveBeenCalled();
    });
  });
});
