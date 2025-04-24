import { Test, TestingModule } from '@nestjs/testing';
import { GamificationController } from './gamification.controller';
import { GamificationService } from '../services/gamification.service';
import { LeaderboardService } from '../services/leaderboard.service';

describe('GamificationController', () => {
  let controller: GamificationController;
  let service: GamificationService;

  const mockGamificationService = {
    grantPoints: jest.fn(),
  };

  const mockLeaderboardService = {
    getLeaderboard: jest.fn(),
    getUserRank: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamificationController],
      providers: [
        { provide: GamificationService, useValue: mockGamificationService },
        { provide: LeaderboardService, useValue: mockLeaderboardService },
      ],
    }).compile();

    controller = module.get<GamificationController>(GamificationController);
    service = module.get<GamificationService>(GamificationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('grantPoints', () => {
    it('should grant points to user and return the updated user', async () => {
      const userId = 1;
      const points = 50;
      const expectedUser = { id: userId.toString(), points: 150 };
      mockGamificationService.grantPoints.mockResolvedValue(expectedUser);

      const result = await controller.grantPoints(userId, points);

      expect(result).toEqual(expectedUser);
      expect(service.grantPoints).toHaveBeenCalledWith(userId, points);
    });

    it('should throw an error if user is not found', async () => {
      const userId = 1;
      const points = 50;
      mockGamificationService.grantPoints.mockRejectedValue(new Error(`User with ID ${userId} not found`));

      await expect(controller.grantPoints(userId, points)).rejects.toThrowError(`User with ID ${userId} not found`);
      expect(service.grantPoints).toHaveBeenCalledWith(userId, points);
    });
  });
});
