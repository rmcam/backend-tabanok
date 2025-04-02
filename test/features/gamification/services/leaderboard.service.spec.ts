import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaderboardService } from '../../../../src/features/gamification/services/leaderboard.service';
import { Leaderboard, LeaderboardCategory, LeaderboardType } from '../../../../src/features/gamification/entities/leaderboard.entity';
import { Gamification } from '../../../../src/features/gamification/entities/gamification.entity';

describe('LeaderboardService', () => {
  let service: LeaderboardService;
  let leaderboardRepository: Repository<Leaderboard>;
  let gamificationRepository: Repository<Gamification>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardService,
        {
          provide: getRepositoryToken(Leaderboard),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Gamification),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LeaderboardService>(LeaderboardService);
    leaderboardRepository = module.get<Repository<Leaderboard>>(
      getRepositoryToken(Leaderboard),
    );
    gamificationRepository = module.get<Repository<Gamification>>(
      getRepositoryToken(Gamification),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateLeaderboards', () => {
    it('should call all update methods', async () => {
      const spyDaily = jest.spyOn(service as any, 'updateDailyLeaderboards');
      const spyWeekly = jest.spyOn(service as any, 'updateWeeklyLeaderboards');
      const spyMonthly = jest.spyOn(service as any, 'updateMonthlyLeaderboards');
      const spyAllTime = jest.spyOn(service as any, 'updateAllTimeLeaderboards');

      await service.updateLeaderboards();

      expect(spyDaily).toHaveBeenCalled();
      expect(spyWeekly).toHaveBeenCalled();
      expect(spyMonthly).toHaveBeenCalled();
      expect(spyAllTime).toHaveBeenCalled();
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard for given type and category', async () => {
      const mockLeaderboard = {
        type: LeaderboardType.DAILY,
        category: LeaderboardCategory.POINTS,
        rankings: [],
      } as Leaderboard;

      jest.spyOn(leaderboardRepository, 'findOne').mockResolvedValue(mockLeaderboard);

      const result = await service.getLeaderboard(
        LeaderboardType.DAILY,
        LeaderboardCategory.POINTS,
      );

      expect(result).toEqual(mockLeaderboard);
      expect(leaderboardRepository.findOne).toHaveBeenCalledWith({
        where: {
          type: LeaderboardType.DAILY,
          category: LeaderboardCategory.POINTS,
          startDate: expect.any(Date),
          endDate: expect.any(Date),
        },
      });
    });

    it('should return null if no leaderboard found', async () => {
      jest.spyOn(leaderboardRepository, 'findOne').mockResolvedValue(null);

      const result = await service.getLeaderboard(
        LeaderboardType.DAILY,
        LeaderboardCategory.POINTS,
      );

      expect(result).toBeNull();
    });

    it('should throw error for invalid type', async () => {
      await expect(service.getLeaderboard(
        'INVALID_TYPE' as LeaderboardType,
        LeaderboardCategory.POINTS
      )).rejects.toThrow();
    });

    it('should throw error for invalid category', async () => {
      await expect(service.getLeaderboard(
        LeaderboardType.DAILY,
        'INVALID_CATEGORY' as LeaderboardCategory
      )).rejects.toThrow();
    });
  });

  describe('getUserRank', () => {
    it('should return user rank and total', async () => {
      const mockLeaderboard = {
        rankings: [
          { userId: '1', rank: 1 },
          { userId: '2', rank: 2 },
        ],
      } as Leaderboard;

      jest.spyOn(service, 'getLeaderboard').mockResolvedValue(mockLeaderboard);

      const result = await service.getUserRank(
        '1',
        LeaderboardType.DAILY,
        LeaderboardCategory.POINTS,
      );

      expect(result).toEqual({ rank: 1, total: 2 });
    });

    it('should return rank 0 if user not found', async () => {
      const mockLeaderboard = {
        rankings: [{ userId: '2', rank: 1 }],
      } as Leaderboard;

      jest.spyOn(service, 'getLeaderboard').mockResolvedValue(mockLeaderboard);

      const result = await service.getUserRank(
        '1',
        LeaderboardType.DAILY,
        LeaderboardCategory.POINTS,
      );

      expect(result).toEqual({ rank: 0, total: 1 });
    });

    it('should handle empty rankings', async () => {
      const mockLeaderboard = {
        rankings: [],
      } as Leaderboard;

      jest.spyOn(service, 'getLeaderboard').mockResolvedValue(mockLeaderboard);

      const result = await service.getUserRank(
        '1',
        LeaderboardType.DAILY,
        LeaderboardCategory.POINTS,
      );

      expect(result).toEqual({ rank: 0, total: 0 });
    });

    it('should handle multiple users with same points', async () => {
      const mockLeaderboard = {
        rankings: [
          { userId: '1', rank: 1 },
          { userId: '2', rank: 1 }, // Same rank
          { userId: '3', rank: 2 },
        ],
      } as Leaderboard;

      jest.spyOn(service, 'getLeaderboard').mockResolvedValue(mockLeaderboard);

      const result = await service.getUserRank(
        '2',
        LeaderboardType.DAILY,
        LeaderboardCategory.POINTS,
      );

      expect(result).toEqual({ rank: 1, total: 3 });
    });
  });

  describe('updateUserRank', () => {
    it('should update user rankings', async () => {
      const mockGamification = {
        user: { id: '1', firstName: 'Test', lastName: 'User' },
        points: 100,
        stats: {},
        achievements: [],
      } as Gamification;

      const mockLeaderboard = {
        id: '1',
        type: LeaderboardType.DAILY,
        category: LeaderboardCategory.POINTS,
        startDate: new Date(),
        endDate: new Date(),
        rankings: [],
        save: jest.fn(),
      } as Leaderboard & { save: jest.Mock };

      jest.spyOn(gamificationRepository, 'findOne').mockResolvedValue(mockGamification);
      jest.spyOn(leaderboardRepository, 'find').mockResolvedValue([mockLeaderboard]);

      await service.updateUserRank('1');

      expect(mockLeaderboard.rankings).toHaveLength(1);
      expect(mockLeaderboard.save).toHaveBeenCalled();
    });

    it('should do nothing if gamification not found', async () => {
      jest.spyOn(gamificationRepository, 'findOne').mockResolvedValue(null);

      await service.updateUserRank('1');

      expect(gamificationRepository.findOne).toHaveBeenCalled();
      expect(leaderboardRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('Private Methods', () => {
    describe('updateDailyLeaderboards', () => {
      it('should update daily leaderboards', async () => {
        const mockLeaderboard = {
          id: '1',
          type: LeaderboardType.DAILY,
          category: LeaderboardCategory.POINTS,
          startDate: new Date(),
          endDate: new Date(),
          rankings: [],
          save: jest.fn(),
        } as Leaderboard & { save: jest.Mock };

        jest.spyOn(leaderboardRepository, 'find').mockResolvedValue([mockLeaderboard]);
        jest.spyOn(gamificationRepository, 'find').mockResolvedValue([]);

        await (service as any).updateDailyLeaderboards();

        expect(leaderboardRepository.find).toHaveBeenCalled();
        expect(mockLeaderboard.save).toHaveBeenCalled();
      });
    });

    describe('updateWeeklyLeaderboards', () => {
      it('should update weekly leaderboards', async () => {
        const mockLeaderboard = {
          id: '1',
          type: LeaderboardType.WEEKLY,
          category: LeaderboardCategory.POINTS,
          startDate: new Date(),
          endDate: new Date(),
          rankings: [],
          save: jest.fn(),
        } as Leaderboard & { save: jest.Mock };

        jest.spyOn(leaderboardRepository, 'find').mockResolvedValue([mockLeaderboard]);
        jest.spyOn(gamificationRepository, 'find').mockResolvedValue([]);

        await (service as any).updateWeeklyLeaderboards();

        expect(leaderboardRepository.find).toHaveBeenCalled();
        expect(mockLeaderboard.save).toHaveBeenCalled();
      });
    });

    describe('updateMonthlyLeaderboards', () => {
      it('should update monthly leaderboards', async () => {
        const mockLeaderboard = {
          id: '1',
          type: LeaderboardType.MONTHLY,
          category: LeaderboardCategory.POINTS,
          startDate: new Date(),
          endDate: new Date(),
          rankings: [],
          save: jest.fn(),
        } as Leaderboard & { save: jest.Mock };

        jest.spyOn(leaderboardRepository, 'find').mockResolvedValue([mockLeaderboard]);
        jest.spyOn(gamificationRepository, 'find').mockResolvedValue([]);

        await (service as any).updateMonthlyLeaderboards();

        expect(leaderboardRepository.find).toHaveBeenCalled();
        expect(mockLeaderboard.save).toHaveBeenCalled();
      });
    });

    describe('updateAllTimeLeaderboards', () => {
      it('should update all-time leaderboards', async () => {
        const mockLeaderboard = {
          id: '1',
          type: LeaderboardType.ALL_TIME,
          category: LeaderboardCategory.POINTS,
          startDate: new Date(),
          endDate: new Date(),
          rankings: [],
          save: jest.fn(),
        } as Leaderboard & { save: jest.Mock };

        jest.spyOn(leaderboardRepository, 'find').mockResolvedValue([mockLeaderboard]);
        jest.spyOn(gamificationRepository, 'find').mockResolvedValue([]);

        await (service as any).updateAllTimeLeaderboards();

        expect(leaderboardRepository.find).toHaveBeenCalled();
        expect(mockLeaderboard.save).toHaveBeenCalled();
      });
    });
  });
});
