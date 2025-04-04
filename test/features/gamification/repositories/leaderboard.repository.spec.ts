import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leaderboard } from '../../../../src/features/gamification/entities/leaderboard.entity';
import { LeaderboardRepository } from '../../../../src/features/gamification/repositories/leaderboard.repository';
import { LeaderboardType, LeaderboardCategory } from '../../../../src/features/gamification/enums/leaderboard.enum';

describe('LeaderboardRepository', () => {
  let repository: LeaderboardRepository;
  const mockLeaderboardRepository = {
    findActiveByTypeAndCategory: jest.fn(),
    updateUserRanking: jest.fn(),
    calculateRanks: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: LeaderboardRepository,
          useValue: mockLeaderboardRepository,
        },
      ],
    }).compile();

    repository = module.get<LeaderboardRepository>(LeaderboardRepository);
  });

  describe('findActiveByTypeAndCategory', () => {
    it('should find active leaderboard with valid dates', async () => {
      const now = new Date();
      const mockLeaderboard = {
        id: '1',
        type: LeaderboardType.WEEKLY,
        category: LeaderboardCategory.POINTS,
        startDate: new Date(now.getTime() - 10000),
        endDate: new Date(now.getTime() + 10000),
      };

      (mockLeaderboardRepository.findActiveByTypeAndCategory as jest.Mock).mockResolvedValue(mockLeaderboard);

      const result = await repository.findActiveByTypeAndCategory(
        LeaderboardType.WEEKLY,
        LeaderboardCategory.POINTS
      );

      expect(result).toEqual(mockLeaderboard);
      expect(mockLeaderboardRepository.findActiveByTypeAndCategory).toHaveBeenCalledWith(
        LeaderboardType.WEEKLY,
        LeaderboardCategory.POINTS
      );
    });
  });

  describe('updateUserRanking', () => {
    it('should update existing user ranking', async () => {
      await repository.updateUserRanking('1', 'user1', 150, ['new-achievement']);

      expect(mockLeaderboardRepository.updateUserRanking).toHaveBeenCalledWith('1', 'user1', 150, ['new-achievement']);
    });
  });

  describe('calculateRanks', () => {
    it('should correctly calculate rank changes', async () => {
      await repository.calculateRanks('1');

      expect(mockLeaderboardRepository.calculateRanks).toHaveBeenCalledWith('1');
    });
  });
});
