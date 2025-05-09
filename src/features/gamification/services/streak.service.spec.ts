import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Streak } from "../entities/streak.entity";
import { GamificationService } from "./gamification.service";
import { StreakService } from "./streak.service";

describe('StreakService', () => {
  let service: StreakService;
  let streakRepositoryMock: MockRepository<Streak>;
  let gamificationServiceMock: Partial<GamificationService>;

  // Mock Repository class
  type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

  beforeEach(async () => {
    streakRepositoryMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    gamificationServiceMock = {
      awardPoints: jest.fn(), // Corregido: usar awardPoints
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreakService,
        {
          provide: getRepositoryToken(Streak),
          useValue: streakRepositoryMock,
        },
        {
          provide: GamificationService,
          useValue: gamificationServiceMock,
        },
      ],
    }).compile();

    service = module.get<StreakService>(StreakService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateStreak', () => {
    const userId = 'test-user-id';
    const pointsEarned = 100;

    it('should initialize streak for the first activity', async () => {
      streakRepositoryMock.findOne.mockResolvedValue(undefined);
      const newStreak = { userId, currentStreak: 0, longestStreak: 0, currentMultiplier: 0, lastActivityDate: null, streakHistory: [], usedGracePeriod: false };
      streakRepositoryMock.create.mockReturnValue(newStreak);

      await service.updateStreak(userId, pointsEarned);

      expect(streakRepositoryMock.findOne).toHaveBeenCalledWith({ where: { userId } });
      expect(streakRepositoryMock.create).toHaveBeenCalledWith({ userId });
      expect(newStreak.currentStreak).toBe(1);
      expect(newStreak.lastActivityDate).toBeInstanceOf(Date);
      expect(newStreak.currentMultiplier).toBe(1);
      expect(newStreak.streakHistory.length).toBe(1);
      expect(newStreak.streakHistory[0]).toEqual(expect.objectContaining({
        pointsEarned,
        bonusMultiplier: 1,
        date: expect.any(Date),
      }));
      expect(streakRepositoryMock.save).toHaveBeenCalledWith(newStreak);
      expect(gamificationServiceMock.awardPoints).not.toHaveBeenCalled(); // Corregido: usar awardPoints
    });

    it('should record activity on the same day without changing streak or multiplier', async () => {
      const existingStreak = {
        userId,
        currentStreak: 3,
        longestStreak: 5,
        currentMultiplier: 1.2,
        lastActivityDate: new Date(new Date().setHours(0, 0, 0, 0)), // Today
        streakHistory: [{ date: new Date(), pointsEarned: 50, bonusMultiplier: 1.1 }],
        usedGracePeriod: false,
      };
      streakRepositoryMock.findOne.mockResolvedValue(existingStreak);

      await service.updateStreak(userId, pointsEarned);

      expect(streakRepositoryMock.findOne).toHaveBeenCalledWith({ where: { userId } });
      expect(streakRepositoryMock.create).not.toHaveBeenCalled();
      expect(existingStreak.currentStreak).toBe(3);
      expect(existingStreak.currentMultiplier).toBeCloseTo(1.2);
      expect(existingStreak.longestStreak).toBe(5);
      expect(existingStreak.streakHistory.length).toBe(2);
      expect(existingStreak.streakHistory[1]).toEqual(expect.objectContaining({
        pointsEarned,
        bonusMultiplier: 1.2,
        date: expect.any(Date),
      }));
      expect(existingStreak.usedGracePeriod).toBe(false);
      expect(streakRepositoryMock.save).toHaveBeenCalledWith(existingStreak);
      expect(gamificationServiceMock.awardPoints).not.toHaveBeenCalled(); // Corregido: usar awardPoints
    });

    it('should increment streak and multiplier for activity on the next day', async () => {
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)); // Yesterday
      const existingStreak = {
        userId,
        currentStreak: 3,
        longestStreak: 5,
        currentMultiplier: 1.2,
        lastActivityDate: new Date(yesterday.setHours(0, 0, 0, 0)),
        streakHistory: [{ date: new Date(), pointsEarned: 50, bonusMultiplier: 1.1 }],
        usedGracePeriod: false,
      };
      streakRepositoryMock.findOne.mockResolvedValue(existingStreak);

      await service.updateStreak(userId, pointsEarned);

      expect(streakRepositoryMock.findOne).toHaveBeenCalledWith({ where: { userId } });
      expect(streakRepositoryMock.create).not.toHaveBeenCalled();
      expect(existingStreak.currentStreak).toBe(4);
      expect(existingStreak.currentMultiplier).toBeCloseTo(1.3); // 1.2 + 0.1
      expect(existingStreak.longestStreak).toBe(5); // Longest streak not updated yet
      expect(existingStreak.streakHistory.length).toBe(2);
      expect(existingStreak.streakHistory[1]).toEqual(expect.objectContaining({
        pointsEarned,
        bonusMultiplier: 1.3,
        date: expect.any(Date),
      }));
      expect(existingStreak.usedGracePeriod).toBe(false);
      expect(streakRepositoryMock.save).toHaveBeenCalledWith(existingStreak);
      expect(gamificationServiceMock.awardPoints).toHaveBeenCalledWith(userId, Math.floor(pointsEarned * (1.3 - 1)), 'streak_bonus', 'Bonus por mantener racha'); // Corregido: usar awardPoints
    });

    it('should maintain streak and multiplier during grace period', async () => {
      const twoDaysAgo = new Date(new Date().setDate(new Date().getDate() - 2)); // Two days ago
      const existingStreak = {
        userId,
        currentStreak: 3,
        longestStreak: 5,
        currentMultiplier: 1.2,
        lastActivityDate: new Date(twoDaysAgo.setHours(0, 0, 0, 0)),
        streakHistory: [{ date: new Date(), pointsEarned: 50, bonusMultiplier: 1.1 }],
        usedGracePeriod: false,
      };
      streakRepositoryMock.findOne.mockResolvedValue(existingStreak);

      await service.updateStreak(userId, pointsEarned);

      expect(streakRepositoryMock.findOne).toHaveBeenCalledWith({ where: { userId } });
      expect(streakRepositoryMock.create).not.toHaveBeenCalled();
      expect(existingStreak.currentStreak).toBe(3);
      expect(existingStreak.currentMultiplier).toBeCloseTo(1.2);
      expect(existingStreak.longestStreak).toBe(5);
      expect(existingStreak.streakHistory.length).toBe(2);
      expect(existingStreak.streakHistory[1]).toEqual(expect.objectContaining({
        pointsEarned,
        bonusMultiplier: 1.2,
        date: expect.any(Date),
      }));
      expect(existingStreak.usedGracePeriod).toBe(true);
      expect(streakRepositoryMock.save).toHaveBeenCalledWith(existingStreak);
      expect(gamificationServiceMock.awardPoints).toHaveBeenCalledWith(userId, Math.floor(pointsEarned * (1.2 - 1)), 'streak_bonus', 'Bonus por mantener racha'); // Corregido: usar awardPoints
    });

    it('should reset streak and multiplier after grace period', async () => {
      const threeDaysAgo = new Date(new Date().setDate(new Date().getDate() - 3)); // Three days ago
      const existingStreak = {
        userId,
        currentStreak: 3,
        longestStreak: 5,
        currentMultiplier: 1.2,
        lastActivityDate: new Date(threeDaysAgo.setHours(0, 0, 0, 0)),
        streakHistory: [{ date: new Date(), pointsEarned: 50, bonusMultiplier: 1.1 }],
        usedGracePeriod: false, // Grace period was not used previously
      };
      streakRepositoryMock.findOne.mockResolvedValue(existingStreak);

      await service.updateStreak(userId, pointsEarned);

      expect(streakRepositoryMock.findOne).toHaveBeenCalledWith({ where: { userId } });
      expect(streakRepositoryMock.create).not.toHaveBeenCalled();
      expect(existingStreak.currentStreak).toBe(1); // Streak reset
      expect(existingStreak.currentMultiplier).toBe(1); // Multiplier reset
      expect(existingStreak.longestStreak).toBe(5); // Longest streak remains
      expect(existingStreak.streakHistory.length).toBe(2);
      expect(existingStreak.streakHistory[1]).toEqual(expect.objectContaining({
        pointsEarned,
        bonusMultiplier: 1, // Bonus multiplier is 1 after reset
        date: expect.any(Date),
      }));
      expect(existingStreak.usedGracePeriod).toBe(false); // Reset grace period flag
      expect(streakRepositoryMock.save).toHaveBeenCalledWith(existingStreak);
      expect(gamificationServiceMock.awardPoints).not.toHaveBeenCalled(); // Corregido: usar awardPoints
    });
  });

  describe('getStreakInfo', () => {
    const userId = 'test-user-id';

    it('should return streak info for an existing user', async () => {
      const existingStreak = {
        userId,
        currentStreak: 5,
        longestStreak: 10,
        currentMultiplier: 1.5,
        lastActivityDate: new Date(),
        streakHistory: [],
        usedGracePeriod: false,
      };
      streakRepositoryMock.findOne.mockResolvedValue(existingStreak);

      const result = await service.getStreakInfo(userId);

      expect(streakRepositoryMock.findOne).toHaveBeenCalledWith({ where: { userId } });
      expect(streakRepositoryMock.create).not.toHaveBeenCalled();
      expect(result).toEqual(existingStreak);
    });

    it('should create and return a new streak if user does not exist', async () => {
      streakRepositoryMock.findOne.mockResolvedValue(undefined);
      const newStreak = { userId, currentStreak: 0, longestStreak: 0, currentMultiplier: 0, lastActivityDate: null, streakHistory: [], usedGracePeriod: false };
      streakRepositoryMock.create.mockReturnValue(newStreak);

      const result = await service.getStreakInfo(userId);

      expect(streakRepositoryMock.findOne).toHaveBeenCalledWith({ where: { userId } });
      expect(streakRepositoryMock.create).toHaveBeenCalledWith({ userId });
      expect(streakRepositoryMock.save).not.toHaveBeenCalled(); // Should not save on get
      expect(result).toEqual(newStreak);
    });
  });
});
