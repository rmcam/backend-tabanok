import { Test, TestingModule } from '@nestjs/testing';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from '../services/leaderboard.service';
import { LeaderboardType, LeaderboardCategory } from '../enums/leaderboard.enum';
import { NotFoundException } from '@nestjs/common';

const mockLeaderboardService = {
  getLeaderboard: jest.fn(),
  getUserRank: jest.fn(),
  updateLeaderboards: jest.fn(),
};

describe('LeaderboardController', () => {
  let controller: LeaderboardController;
  let service: LeaderboardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaderboardController],
      providers: [
        { provide: LeaderboardService, useValue: mockLeaderboardService },
      ],
    }).compile();

    controller = module.get<LeaderboardController>(LeaderboardController);
    service = module.get<LeaderboardService>(LeaderboardService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getLeaderboard', () => {
    it('should return a leaderboard', async () => {
      const type = LeaderboardType.ALL_TIME; // Using a valid type
      const category = LeaderboardCategory.POINTS; // Using a valid category
      const expectedResult = [{ userId: 'user1', rank: 1, score: 100 }];
      mockLeaderboardService.getLeaderboard.mockResolvedValue(expectedResult);

      const result = await controller.getLeaderboard(type, category);

      expect(result).toEqual(expectedResult);
      expect(service.getLeaderboard).toHaveBeenCalledWith(type, category);
    });

    it('should throw NotFoundException if leaderboard is not found', async () => {
      const type = LeaderboardType.WEEKLY; // Using a valid type
      const category = LeaderboardCategory.LESSONS_COMPLETED; // Using the correct enum value
      mockLeaderboardService.getLeaderboard.mockResolvedValue(null);

      await expect(controller.getLeaderboard(type, category)).rejects.toThrow(NotFoundException);
      expect(service.getLeaderboard).toHaveBeenCalledWith(type, category);
    });
  });

  describe('getUserRanking', () => {
    it('should return a user ranking', async () => {
      const userId = 'user-uuid';
      const type = LeaderboardType.MONTHLY; // Using a valid type
      const category = LeaderboardCategory.POINTS; // Using a valid category
      const expectedResult = { userId: 'user-uuid', rank: 5 };
      mockLeaderboardService.getUserRank.mockResolvedValue(expectedResult);

      const result = await controller.getUserRanking(userId, type, category);

      expect(result).toEqual(expectedResult);
      expect(service.getUserRank).toHaveBeenCalledWith(userId, type, category);
    });
  });

  describe('updateAllLeaderboards', () => {
    it('should update all leaderboards', async () => {
      mockLeaderboardService.updateLeaderboards.mockResolvedValue(undefined);

      const result = await controller.updateAllLeaderboards();

      expect(result).toEqual({ message: 'Leaderboards actualizados' });
      expect(service.updateLeaderboards).toHaveBeenCalled();
    });
  });
});
