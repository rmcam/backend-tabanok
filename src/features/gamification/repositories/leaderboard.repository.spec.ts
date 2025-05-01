import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { LeaderboardRepository } from './leaderboard.repository';
import { Leaderboard } from '../entities/leaderboard.entity';
import { LeaderboardType, LeaderboardCategory } from '../enums/leaderboard.enum';

// Mock EntityManager, including the transaction method
const mockEntityManager = {
    transaction: jest.fn(async (cb) => {
        // Create a mock transactional entity manager for the callback
        const mockTransactionalEntityManager = {
            findOne: jest.fn(), // Mock findOne within transaction
            update: jest.fn(), // Mock update within transaction
            // Add other methods used within the transaction callback
        };
        // Execute the callback with the mock transactional entity manager
        return cb(mockTransactionalEntityManager);
    }),
    // Mock other EntityManager methods if used outside transactions
    findOne: jest.fn(),
    update: jest.fn(),
};


describe('LeaderboardRepository', () => {
  let repository: LeaderboardRepository;
  let mockEntityManager: EntityManager; // Keep a reference to the mocked EntityManager

  // Mock EntityManager, including the transaction method and base repository methods
  const mockEntityManagerMethods = {
    transaction: jest.fn((cb) => {
      // Create a mock transactional entity manager
      const mockTransactionalEntityManager = {
        findOne: jest.fn() as jest.Mock, // Mock findOne within transaction
        update: jest.fn() as jest.Mock, // Mock update within transaction
        // Add other methods used within the transaction callback
      };
      // Store the callback and return the transactional entity manager mock
      // The test will be responsible for calling the stored callback with the mock
      (mockEntityManagerMethods.transaction as any).latestCallback = cb;
      return mockTransactionalEntityManager;
    }) as jest.Mock & { latestCallback?: (entityManager: any) => Promise<any> }, // Cast transaction to jest.Mock and add latestCallback property
    // Mock base Repository methods directly on the EntityManager mock
    findOne: jest.fn() as jest.Mock, // Cast findOne to jest.Mock
    update: jest.fn() as jest.Mock, // Cast update to jest.Mock
    // Add other base Repository methods if used (e.g., save, delete, find)
  };


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Provide the mock EntityManager
        {
          provide: EntityManager,
          useValue: mockEntityManagerMethods, // Use the combined mock
        },
        // Provide the actual custom repository class
        LeaderboardRepository, // NestJS should instantiate this and inject the mocks
      ],
    }).compile();

    // Get the instance of the custom repository and the mocked EntityManager
    repository = module.get<LeaderboardRepository>(LeaderboardRepository);
    mockEntityManager = module.get<EntityManager>(EntityManager); // Get the mocked EntityManager

    // Manually assign the mocked EntityManager to the repository instance
    // This is necessary because NestJS's testing module might not automatically
    // set the 'manager' property on a custom repository that extends Repository.
    (repository as any).manager = mockEntityManager;

    // Spy on the inherited methods of the repository instance and implement them
    jest.spyOn(repository, 'findOne').mockImplementation((options) =>
      mockEntityManager.findOne(Leaderboard, options)
    );
    jest.spyOn(repository, 'update').mockImplementation((criteria, partialEntity) =>
      mockEntityManager.update(Leaderboard, criteria, partialEntity)
    );


    // Reset mocks before each test
    jest.clearAllMocks(); // This clears mocks on mockEntityManagerMethods and the spied methods
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findActiveByTypeAndCategory', () => {
    it('should call findOne with correct parameters and relations', async () => {
      const type = LeaderboardType.ALL_TIME;
      const category = LeaderboardCategory.POINTS;
      const mockLeaderboard = new Leaderboard();
      // Mock the findOne method on the spied repository method
      (repository.findOne as jest.Mock).mockResolvedValue(mockLeaderboard);

      const result = await repository.findActiveByTypeAndCategory(type, category);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          type,
          category,
          startDate: expect.any(Object), // Expecting a FindOperator object
          endDate: expect.any(Object), // Expecting a FindOperator object
        },
        relations: ['user'],
      });
      expect(result).toEqual(mockLeaderboard);
    });
  });

  describe('updateUserRanking', () => {
    it('should update existing user ranking within a transaction', async () => {
      const leaderboardId = 'lb-id';
      const userId = 'user-id';
      const score = 100;
      const achievements = ['ach1'];
      const existingRankings = [{ userId, name: 'User', score: 50, achievements: [], rank: 1, change: 0 }];
      const mockLeaderboard = { id: leaderboardId, rankings: existingRankings };

      // Call the repository method, which triggers the transaction mock
      repository.updateUserRanking(leaderboardId, userId, score, achievements);

      // Get the stored callback and the transactional entity manager mock
      const transactionCallback = (mockEntityManager.transaction as any).latestCallback;
      const mockTransactionalEntityManager = (mockEntityManager.transaction as jest.Mock).mock.results[0].value;

      // Set up mocks on the transactional entity manager BEFORE executing the callback
      (mockTransactionalEntityManager as any).findOne.mockResolvedValue(mockLeaderboard);
      (mockTransactionalEntityManager as any).update.mockResolvedValue({ affected: 1 });

      // Manually execute the transaction callback
      await transactionCallback(mockTransactionalEntityManager);

      expect(mockEntityManager.transaction).toHaveBeenCalled();
      expect((mockTransactionalEntityManager as any).findOne).toHaveBeenCalledWith(Leaderboard, { where: { id: leaderboardId } });
      expect((mockTransactionalEntityManager as any).update).toHaveBeenCalledWith(Leaderboard, leaderboardId, {
        rankings: [{ userId, name: 'User', score, achievements, rank: 1, change: 0 }],
      });
    });

    it('should add new user ranking within a transaction if user not found', async () => {
        const leaderboardId = 'lb-id';
        const userId = 'new-user-id';
        const score = 100;
        const achievements = ['ach1'];
        const existingRankings = [{ userId: 'other-user', name: 'Other', score: 50, achievements: [], rank: 1, change: 0 }];
        const mockLeaderboard = { id: leaderboardId, rankings: existingRankings };

        // Call the repository method, which triggers the transaction mock
        repository.updateUserRanking(leaderboardId, userId, score, achievements);

        // Get the stored callback and the transactional entity manager mock
        const transactionCallback = (mockEntityManager.transaction as any).latestCallback;
        const mockTransactionalEntityManager = (mockEntityManager.transaction as jest.Mock).mock.results[0].value;

        // Set up mocks on the transactional entity manager BEFORE executing the callback
        (mockTransactionalEntityManager as any).findOne.mockResolvedValue(mockLeaderboard);
        (mockTransactionalEntityManager as any).update.mockResolvedValue({ affected: 1 });

        // Manually execute the transaction callback
        await transactionCallback(mockTransactionalEntityManager);

        expect(mockEntityManager.transaction).toHaveBeenCalled();
        expect((mockTransactionalEntityManager as any).findOne).toHaveBeenCalledWith(Leaderboard, { where: { id: leaderboardId } });
        expect((mockTransactionalEntityManager as any).update).toHaveBeenCalledWith(Leaderboard, leaderboardId, {
          rankings: expect.arrayContaining([
            ...existingRankings,
            { userId, name: '', score, achievements, rank: 0, change: 0 }
          ]),
        });
      });

    it('should throw error if leaderboard not found within transaction', async () => {
        const leaderboardId = 'non-existent-lb-id';
        const userId = 'user-id';
        const score = 100;
        const achievements = ['ach1'];

        // Call the repository method, which triggers the transaction mock
        const updateUserRankingPromise = repository.updateUserRanking(leaderboardId, userId, score, achievements);

        // Get the stored callback and the transactional entity manager mock
        const transactionCallback = (mockEntityManager.transaction as any).latestCallback;
        const mockTransactionalEntityManager = (mockEntityManager.transaction as jest.Mock).mock.results[0].value;

        // Set up mocks on the transactional entity manager BEFORE executing the callback
        (mockTransactionalEntityManager as any).findOne.mockResolvedValue(undefined);

        // Manually execute the transaction callback and expect it to throw
        await expect(transactionCallback(mockTransactionalEntityManager)).rejects.toThrow('Leaderboard not found');

        expect(mockEntityManager.transaction).toHaveBeenCalled();
        expect((mockTransactionalEntityManager as any).findOne).toHaveBeenCalledWith(Leaderboard, { where: { id: leaderboardId } });
        expect((mockTransactionalEntityManager as any).update).not.toHaveBeenCalled();
    });
  });

  describe('calculateRanks', () => {
    it('should calculate and update ranks correctly', async () => {
      const leaderboardId = 'lb-id';
      const initialRankings = [
        { userId: 'user1', name: 'User 1', score: 50, achievements: [], rank: 1, change: 0 },
        { userId: 'user2', name: 'User 2', score: 100, achievements: [], rank: 2, change: 0 },
        { userId: 'user3', name: 'User 3', score: 75, achievements: [], rank: 3, change: 0 },
      ];
      const mockLeaderboard = { id: leaderboardId, rankings: initialRankings };

      // Mock the findOne and update methods on the spied repository methods
      (repository.findOne as jest.Mock).mockResolvedValue(mockLeaderboard);
      (repository.update as jest.Mock).mockResolvedValue({ affected: 1 });

      await repository.calculateRanks(leaderboardId);

      const expectedRanked = [
        { userId: 'user2', name: 'User 2', score: 100, achievements: [], rank: 1, change: 1 },
        { userId: 'user3', name: 'User 3', score: 75, achievements: [], rank: 2, change: 1 },
        { userId: 'user1', name: 'User 1', score: 50, achievements: [], rank: 3, change: -2 },
      ];

      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: leaderboardId } });
      expect(repository.update).toHaveBeenCalledWith(leaderboardId, {
        rankings: expectedRanked,
      });
    });

    it('should handle empty rankings array', async () => {
        const leaderboardId = 'lb-id';
        const initialRankings: any[] = [];
        const mockLeaderboard = { id: leaderboardId, rankings: initialRankings };

        (repository.findOne as jest.Mock).mockResolvedValue(mockLeaderboard);
        (repository.update as jest.Mock).mockResolvedValue({ affected: 1 });

        await repository.calculateRanks(leaderboardId);

        expect(repository.findOne).toHaveBeenCalledWith({ where: { id: leaderboardId } });
        expect(repository.update).toHaveBeenCalledWith(leaderboardId, {
          rankings: [],
        });
    });

    it('should throw error if leaderboard not found', async () => {
        const leaderboardId = 'non-existent-lb-id';
        (repository.findOne as jest.Mock).mockResolvedValue(undefined);

        await expect(repository.calculateRanks(leaderboardId)).rejects.toThrow('Leaderboard not found');
        expect(repository.findOne).toHaveBeenCalledWith({ where: { id: leaderboardId } });
        expect(repository.update).not.toHaveBeenCalled();
    });
  });
});
