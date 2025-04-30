import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CollaborationRewardService } from './collaboration-reward.service';
import { CollaborationReward, CollaborationType } from '../entities/collaboration-reward.entity';
import { Gamification } from '../entities/gamification.entity';
import { UserReward } from '../entities/user-reward.entity';

describe('CollaborationRewardService', () => {
  let service: CollaborationRewardService;
  let mockCollaborationRewardRepository;
  let mockGamificationRepository;
  let mockUserRewardRepository;

  beforeEach(async () => {
    mockCollaborationRewardRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };
    mockGamificationRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    mockUserRewardRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollaborationRewardService,
        {
          provide: getRepositoryToken(CollaborationReward),
          useValue: mockCollaborationRewardRepository,
        },
        {
          provide: getRepositoryToken(Gamification),
          useValue: mockGamificationRepository,
        },
        {
          provide: getRepositoryToken(UserReward),
          useValue: mockUserRewardRepository,
        },
      ],
    }).compile();

    service = module.get<CollaborationRewardService>(CollaborationRewardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('awardCollaboration', () => {
    it('should award collaboration points and save entities', async () => {
      // Arrange
      const userId = 'test-user-id';
      const contributionId = 'test-contribution-id';
      const type = CollaborationType.CONTENIDO_CREACION;
      const quality = 'good';
      const reviewerId = 'test-reviewer-id';

      const mockReward = {
        basePoints: 10,
        qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
        streakBonuses: [{ threshold: 3, multiplier: 0.1 }],
        history: [],
        specialBadge: null,
      };

      const mockGamification = {
        userId,
        points: 0,
        recentActivities: [],
      };

      mockCollaborationRewardRepository.findOne.mockResolvedValue(mockReward);
      mockGamificationRepository.findOne.mockResolvedValue(mockGamification);
      mockUserRewardRepository.findOne.mockResolvedValue(null);

      // Act
      await service.awardCollaboration(
        userId,
        contributionId,
        type,
        quality,
        reviewerId
      );

      // Assert
      expect(mockCollaborationRewardRepository.findOne).toHaveBeenCalledWith({
        where: { type },
      });
      expect(mockGamificationRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockUserRewardRepository.findOne).not.toHaveBeenCalled();

      // Calculate expected points: 10 * 1.2 = 12
      const expectedPoints = 12;

      expect(mockReward.history.length).toBe(1);
      expect(mockReward.history[0]).toMatchObject({
        userId,
        contributionId,
        type,
        quality,
        pointsAwarded: expectedPoints,
        reviewedBy: reviewerId,
      });

      expect(mockGamification.points).toBe(expectedPoints);
      expect(mockGamification.recentActivities.length).toBe(1);
      expect(mockGamification.recentActivities[0]).toMatchObject({
        type: 'collaboration',
        description: `Contribución ${type.toLowerCase()} - Calidad: ${quality}`,
        pointsEarned: expectedPoints,
      });

      expect(mockCollaborationRewardRepository.save).toHaveBeenCalledWith(mockReward);
      expect(mockGamificationRepository.save).toHaveBeenCalledWith(mockGamification);
      expect(mockUserRewardRepository.save).not.toHaveBeenCalled();
  });

  describe('getCollaborationStats', () => {
    it('should return default stats for a user with no contributions', async () => {
      const userId = 'test-user-id';
      const mockRewards: CollaborationReward[] = [
        {
          type: CollaborationType.CONTENIDO_CREACION,
          basePoints: 10,
          qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
          streakBonuses: [],
          history: [], // No history for this user
          specialBadge: null,
        } as CollaborationReward,
      ];

      mockCollaborationRewardRepository.find.mockResolvedValue(mockRewards);
      jest.spyOn(service as any, 'calculateContributionStreak').mockReturnValue(0); // Mock private method

      const result = await service.getCollaborationStats(userId);

      expect(mockCollaborationRewardRepository.find).toHaveBeenCalled();
      expect(result).toEqual({
        totalContributions: 0,
        excellentContributions: 0,
        currentStreak: 0,
        totalPoints: 0,
        badges: [],
      });
      expect((service as any)['calculateContributionStreak']).toHaveBeenCalledWith([]);
    });

    it('should return correct stats for a user with contributions', async () => {
      const userId = 'test-user-id';
      const mockRewards: CollaborationReward[] = [
        {
          type: CollaborationType.CONTENIDO_CREACION,
          basePoints: 10,
          qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
          streakBonuses: [],
          history: [
            { userId, type: CollaborationType.CONTENIDO_CREACION, quality: 'good', pointsAwarded: 12, awardedAt: new Date() },
            { userId, type: CollaborationType.CONTENIDO_CREACION, quality: 'excellent', pointsAwarded: 15, awardedAt: new Date() },
          ] as any[],
          specialBadge: null,
        } as CollaborationReward,
        {
          type: CollaborationType.CONTENIDO_REVISION,
          basePoints: 5,
          qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
          streakBonuses: [],
          history: [
            { userId, type: CollaborationType.CONTENIDO_REVISION, quality: 'average', pointsAwarded: 5, awardedAt: new Date() },
          ] as any[],
          specialBadge: null,
        } as CollaborationReward,
      ];

      mockCollaborationRewardRepository.find.mockResolvedValue(mockRewards);
      jest.spyOn(service as any, 'calculateContributionStreak').mockReturnValue(2); // Mock private method

      const result = await service.getCollaborationStats(userId);

      expect(mockCollaborationRewardRepository.find).toHaveBeenCalled();
      expect(result).toEqual({
        totalContributions: 3,
        excellentContributions: 1,
        currentStreak: 2,
        totalPoints: 12 + 15 + 5,
        badges: [],
      });
      expect((service as any)['calculateContributionStreak']).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ userId, quality: 'good', pointsAwarded: 12 }),
        expect.objectContaining({ userId, quality: 'excellent', pointsAwarded: 15 }),
        expect.objectContaining({ userId, quality: 'average', pointsAwarded: 5 }),
      ]));
    });

    it('should return correct stats filtered by type', async () => {
      const userId = 'test-user-id';
      const type = CollaborationType.CONTENIDO_CREACION;
      const mockRewards: CollaborationReward[] = [
        {
          type: CollaborationType.CONTENIDO_CREACION,
          basePoints: 10,
          qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
          streakBonuses: [],
          history: [
            { userId, type: CollaborationType.CONTENIDO_CREACION, quality: 'good', pointsAwarded: 12, awardedAt: new Date() },
            { userId, type: CollaborationType.CONTENIDO_CREACION, quality: 'excellent', pointsAwarded: 15, awardedAt: new Date() },
          ] as any[],
          specialBadge: null,
        } as CollaborationReward,
        {
          type: CollaborationType.CONTENIDO_REVISION,
          basePoints: 5,
          qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
          streakBonuses: [],
          history: [
            { userId, type: CollaborationType.CONTENIDO_REVISION, quality: 'average', pointsAwarded: 5, awardedAt: new Date() },
          ] as any[],
          specialBadge: null,
        } as CollaborationReward,
      ];

      mockCollaborationRewardRepository.find.mockResolvedValue(mockRewards);
      jest.spyOn(service as any, 'calculateContributionStreak').mockReturnValue(2); // Mock private method

      const result = await service.getCollaborationStats(userId, type);

      expect(mockCollaborationRewardRepository.find).toHaveBeenCalled();
      expect(result).toEqual({
        totalContributions: 2,
        excellentContributions: 1,
        currentStreak: 2, // Streak is calculated across all contributions, not just filtered type
        totalPoints: 12 + 15,
        badges: [],
      });
      // calculateContributionStreak is called with all contributions, not just filtered ones
      expect((service as any)['calculateContributionStreak']).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ userId, quality: 'good', pointsAwarded: 12 }),
        expect.objectContaining({ userId, quality: 'excellent', pointsAwarded: 15 }),
        expect.objectContaining({ userId, quality: 'average', pointsAwarded: 5 }),
      ]));
    });

    it('should include special badges if requirements are met', async () => {
      const userId = 'test-user-id';
      const mockBadge = {
        id: 'badge-1',
        name: 'Excellent Contributor',
        icon: 'icon.png',
        requirementCount: 2,
      };
      const mockRewards: CollaborationReward[] = [
        {
          type: CollaborationType.CONTENIDO_CREACION,
          basePoints: 10,
          qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
          streakBonuses: [],
          history: [
            { userId, quality: 'excellent', pointsAwarded: 15, awardedAt: new Date() },
            { userId, quality: 'excellent', pointsAwarded: 15, awardedAt: new Date() },
            { userId, quality: 'good', pointsAwarded: 12, awardedAt: new Date() },
          ] as any[],
          specialBadge: mockBadge as any,
        } as CollaborationReward,
      ];

      mockCollaborationRewardRepository.find.mockResolvedValue(mockRewards);
      jest.spyOn(service as any, 'calculateContributionStreak').mockReturnValue(3); // Mock private method

      const result = await service.getCollaborationStats(userId);

      expect(mockCollaborationRewardRepository.find).toHaveBeenCalled();
      expect(result).toEqual({
        totalContributions: 3,
        excellentContributions: 2,
        currentStreak: 3,
        totalPoints: 15 + 15 + 12,
        badges: [
          {
            id: 'badge-1',
            name: 'Excellent Contributor',
            icon: 'icon.png',
            description: `Insignia especial por contribuciones excelentes de tipo ${CollaborationType.CONTENIDO_CREACION}`,
            category: "collaboration",
            tier: "gold",
            iconUrl: 'icon.png',
          },
        ],
      });
      expect((service as any)['calculateContributionStreak']).toHaveBeenCalled();
    });

    it('should use cache if available', async () => {
      const userId = 'test-user-id';
      const cachedStats = {
        totalContributions: 5,
        excellentContributions: 3,
        currentStreak: 4,
        totalPoints: 100,
        badges: [],
      };
      const cacheKey = `${userId}-all`;
      (service as any).collaborationStatsCache.set(cacheKey, cachedStats); // Access private cache

      const result = await service.getCollaborationStats(userId);

      expect(mockCollaborationRewardRepository.find).not.toHaveBeenCalled(); // Should not hit repository
      expect(result).toEqual(cachedStats);
    });

    it('should clear cache for user on awardCollaboration', async () => {
      const userId = 'test-user-id';
      const cacheKeyAll = `${userId}-all`;
      const cacheKeyType = `${userId}-${CollaborationType.CONTENIDO_CREACION}`;
      (service as any).collaborationStatsCache.set(cacheKeyAll, {}); // Add dummy cache entries
      (service as any).collaborationStatsCache.set(cacheKeyType, {});
      (service as any).collaborationStatsCache.set('other-user-all', {}); // Keep other user's cache

      const mockReward = {
        basePoints: 10,
        qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
        streakBonuses: [],
        history: [],
        specialBadge: null,
      };
      const mockGamification = {
        userId,
        points: 0,
        recentActivities: [],
      };

      mockCollaborationRewardRepository.findOne.mockResolvedValue(mockReward);
      mockGamificationRepository.findOne.mockResolvedValue(mockGamification);
      mockUserRewardRepository.findOne.mockResolvedValue(null);
      mockCollaborationRewardRepository.save.mockResolvedValue(mockReward);
      mockGamificationRepository.save.mockResolvedValue(mockGamification);
      jest.spyOn(service as any, 'calculateContributionStreak').mockReturnValue(0);

      await service.awardCollaboration(userId, 'contrib-id', CollaborationType.CONTENIDO_CREACION, 'good');

      expect((service as any).collaborationStatsCache.has(cacheKeyAll)).toBe(false);
      expect((service as any).collaborationStatsCache.has(cacheKeyType)).toBe(false);
      expect((service as any).collaborationStatsCache.has('other-user-all')).toBe(true); // Other user's cache should remain
    });
  });
});
});
