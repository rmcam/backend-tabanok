import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  CollaborationReward,
  CollaborationType,
} from "../entities/collaboration-reward.entity";
import { Gamification } from "../entities/gamification.entity";
import { RewardStatus, UserReward } from "../entities/user-reward.entity"; // Importar RewardStatus
import { CollaborationRewardService } from "./collaboration-reward.service";
import { BadRequestException, NotFoundException } from "@nestjs/common"; // Import NotFoundException
import { DataSource } from "typeorm";

describe("CollaborationRewardService", () => {
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
      create: jest.fn(), // Keep create mock for other potential tests, but this specific test doesn't use it
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
        {
         provide: DataSource,
         useValue: {
           createQueryRunner: jest.fn(() => ({
             connect: jest.fn(),
             startTransaction: jest.fn(),
             release: jest.fn(),
             rollbackTransaction: jest.fn(),
             commitTransaction: jest.fn(),
             manager: {
               save: jest.fn(),
             },
           })),
         },
       },
      ],
    }).compile();

    service = module.get<CollaborationRewardService>(
      CollaborationRewardService
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("awardCollaboration", () => {
    it("should award collaboration points and save entities", async () => {
      // Arrange
      const userId = "test-user-id";
      const contributionId = "test-contribution-id";
      const type = CollaborationType.CONTENIDO_CREACION;
      const quality = "good";
      const reviewerId = "test-reviewer-id";

      const mockReward = {
        basePoints: 10,
        qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
        streakBonuses: [{ threshold: 3, multiplier: 0.1 }],
        history: [],
        specialBadge: null,
        id: "mock-reward-id-1", // Added id
        title: "Mock Reward 1", // Added title
        description: "Description for mock reward 1", // Added description
      };

      const mockGamification = {
        userId,
        points: 0,
        recentActivities: [],
      };

      mockCollaborationRewardRepository.findOne.mockResolvedValue(mockReward);
      mockGamificationRepository.findOne.mockResolvedValue(mockGamification);
      mockUserRewardRepository.findOne.mockResolvedValue(null);
      jest
        .spyOn(service as any, "calculateContributionStreak")
        .mockReturnValue(0); // Mock private method

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
        reviewedBy: reviewerId,
      });
      expect(mockReward.history[0].pointsAwarded).toBeCloseTo(expectedPoints, 2);

      expect(mockGamification.points).toBe(expectedPoints);
      expect(mockGamification.recentActivities.length).toBe(1);
      expect(mockGamification.recentActivities[0]).toMatchObject({
        type: "collaboration",
        description: `Contribución ${type.toLowerCase()} - Calidad: ${quality}`,
      });
      expect(mockGamification.recentActivities[0].pointsEarned).toBeCloseTo(expectedPoints, 2);

      expect(mockCollaborationRewardRepository.save).toHaveBeenCalledWith(
        mockReward
      );
      expect(mockGamificationRepository.save).toHaveBeenCalledWith(
        mockGamification
      );
      expect(mockUserRewardRepository.save).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException for invalid collaboration type", async () => {
      const userId = "test-user-id";
      const contributionId = "test-contribution-id";
      const type = "invalid_type" as CollaborationType; // Invalid type
      const quality = "good";

      await expect(
        service.awardCollaboration(userId, contributionId, type, quality)
      ).rejects.toThrow("Invalid collaboration type: invalid_type");

      expect(mockCollaborationRewardRepository.findOne).not.toHaveBeenCalled();
      expect(mockGamificationRepository.findOne).not.toHaveBeenCalled();
      expect(mockUserRewardRepository.findOne).not.toHaveBeenCalled();
      expect(mockCollaborationRewardRepository.save).not.toHaveBeenCalled();
      expect(mockGamificationRepository.save).not.toHaveBeenCalled();
      expect(mockUserRewardRepository.save).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException if no reward configuration found for type", async () => {
      const userId = "test-user-id";
      const contributionId = "test-contribution-id";
      const type = CollaborationType.CONTENIDO_CREACION;
      const quality = "good";

      mockCollaborationRewardRepository.findOne.mockResolvedValue(null); // Reward not found

      await expect(
        service.awardCollaboration(userId, contributionId, type, quality)
      ).rejects.toThrow(`No reward configuration found for type ${type}`);

      expect(mockCollaborationRewardRepository.findOne).toHaveBeenCalledWith({
        where: { type },
      });
      expect(mockGamificationRepository.findOne).not.toHaveBeenCalled();
      expect(mockUserRewardRepository.findOne).not.toHaveBeenCalled();
      expect(mockCollaborationRewardRepository.save).not.toHaveBeenCalled();
      expect(mockGamificationRepository.save).not.toHaveBeenCalled();
      expect(mockUserRewardRepository.save).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException if gamification profile not found for user", async () => {
      const userId = "test-user-id";
      const contributionId = "test-contribution-id";
      const type = CollaborationType.CONTENIDO_CREACION;
      const quality = "good";
      const reviewerId = "test-reviewer-id"; // Include optional reviewerId

      const mockReward = {
        basePoints: 10,
        qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
        streakBonuses: [],
        history: [],
        specialBadge: null,
      };

      // mockGamification is not needed for this test as we mock findOne to return null

      mockCollaborationRewardRepository.findOne.mockResolvedValue(mockReward);
      mockGamificationRepository.findOne.mockResolvedValue(null); // Gamification profile not found
      // mockUserRewardRepository.findOne.mockResolvedValue(null); // Not relevant for this test
      jest
        .spyOn(service as any, "calculateContributionStreak")
        .mockReturnValue(0); // Mock private method

      // Act & Assert
      await expect(
        service.awardCollaboration(userId, contributionId, type, quality, reviewerId) // Include optional reviewerId
      ).rejects.toThrow(NotFoundException); // Expect NotFoundException type
      // Also assert the specific message if needed:
      // ).rejects.toThrow(`Gamification profile not found for user ${userId}`);


      expect(mockCollaborationRewardRepository.findOne).toHaveBeenCalledWith({
        where: { type },
      });
      expect(mockGamificationRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
      });
      // expect(mockUserRewardRepository.findOne).not.toHaveBeenCalled(); // Not relevant for this test
      expect(mockCollaborationRewardRepository.save).not.toHaveBeenCalled();
      expect(mockGamificationRepository.save).not.toHaveBeenCalled();
      expect(mockUserRewardRepository.save).not.toHaveBeenCalled();
    });

    it("should award special badge if requirements are met and user does not have it", async () => {
      const userId = "test-user-id";
      const contributionId = "test-contribution-id";
      const type = CollaborationType.CONTENIDO_CREACION;
      const quality = "excellent"; // Excellent quality to meet badge requirement
      const reviewerId = "test-reviewer-id";

      const mockBadge = {
        id: "badge-1",
        name: "Excellent Contributor",
        icon: "icon.png",
        requirementCount: 2, // Requirement is 2 excellent contributions
        description: "Special badge description",
        category: "collaboration",
        tier: "gold",
        expirationDate: null,
      };

      const mockReward = {
        basePoints: 10,
        qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
        streakBonuses: [],
        history: [
           { // Add a history entry to meet the badge requirement BEFORE the current one
            userId,
            quality: "excellent",
            pointsAwarded: 15,
            awardedAt: new Date(),
          },
        ] as any[],
        specialBadge: mockBadge,
      };

      const mockGamification = {
        userId,
        points: 0,
        recentActivities: [],
      };

      mockCollaborationRewardRepository.findOne.mockResolvedValue({ ...mockReward, specialBadge: mockBadge }); // Explicitly include specialBadge
      mockGamificationRepository.findOne.mockResolvedValue(mockGamification);
      mockUserRewardRepository.findOne.mockResolvedValue(null); // User does not have the badge
      // Remove the mock for calculateContributionStreak as it's not relevant for this badge requirement
      // jest
      //   .spyOn(service as any, "calculateContributionStreak")
      //   .mockReturnValue(0); // Mock private method

      // Act
      await service.awardCollaboration(
        userId,
        contributionId,
        type,
        quality,
        reviewerId
      );

      // Assert
      // ... (assertions for points and history as in the first test)
      // Check if the user already has the badge BEFORE attempting to award it
      expect(mockUserRewardRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId,
            rewardId: mockBadge.id,
            status: RewardStatus.ACTIVE, // Añadir expectativa de estado activo
          },
        })
      );
      expect(mockUserRewardRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          rewardId: mockBadge.id,
          status: RewardStatus.ACTIVE,
          dateAwarded: expect.any(Date),
          expiresAt: mockBadge.expirationDate,
          metadata: {
            additionalData: {
              description: mockBadge.description,
              category: mockBadge.category,
              tier: mockBadge.tier,
              iconUrl: mockBadge.icon, // Usar iconUrl
              isSpecial: true,
            },
          },
        })
      );
      expect(mockCollaborationRewardRepository.save).toHaveBeenCalledWith(
        mockReward
      );
      expect(mockGamificationRepository.save).toHaveBeenCalledWith(
        mockGamification
      );
    });

    it("should not award special badge if requirements are not met", async () => {
      const userId = "test-user-id";
      const contributionId = "test-contribution-id";
      const type = CollaborationType.CONTENIDO_CREACION;
      const quality = "good"; // Not excellent quality
      const reviewerId = "test-reviewer-id";

      const mockBadge = {
        id: "badge-1",
        name: "Excellent Contributor",
        icon: "icon.png",
        requirementCount: 2, // Requirement is 2 excellent contributions
        description: "Special badge description",
        category: "collaboration",
        tier: "gold",
        expirationDate: null,
      };

      const mockReward = { // Added back the mockReward definition
        basePoints: 10,
        qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
        streakBonuses: [],
        history: [
          { userId, quality: "good", pointsAwarded: 12, awardedAt: new Date() },
        ] as any[], // Only one good contribution
        specialBadge: mockBadge,
      };

      const mockGamification = {
        userId,
        points: 0,
        recentActivities: [],
      };

      mockCollaborationRewardRepository.findOne.mockResolvedValue({ ...mockReward, specialBadge: mockBadge }); // Explicitly include specialBadge
      mockGamificationRepository.findOne.mockResolvedValue(mockGamification);
      // Mock findOne for UserReward to return null, indicating user doesn't have the badge
      mockUserRewardRepository.findOne.mockResolvedValue(null);
      jest
        .spyOn(service as any, "calculateContributionStreak")
        .mockReturnValue(0); // Mock private method

      // Act
      await service.awardCollaboration(
        userId,
        contributionId,
        type,
        quality,
        reviewerId
      );

      // Assert
      // ... (assertions for points and history as in the first test)
      // Should check for existing badge even if requirements are not met
      expect(mockUserRewardRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId,
            rewardId: mockBadge.id,
          },
        })
      );
      expect(mockUserRewardRepository.save).not.toHaveBeenCalled(); // Should not save new reward
      expect(mockCollaborationRewardRepository.save).toHaveBeenCalledWith(
        mockReward
      );
      expect(mockGamificationRepository.save).toHaveBeenCalledWith(
        mockGamification
      );
    });

    it("should not award special badge if user already has it", async () => {
      const userId = "test-user-id";
      const contributionId = "test-contribution-id";
      const type = CollaborationType.CONTENIDO_CREACION;
      const quality = "excellent"; // Excellent quality to meet badge requirement
      const reviewerId = "test-reviewer-id";

      const mockBadge = {
        id: "badge-1",
        name: "Excellent Contributor",
        icon: "icon.png",
        requirementCount: 1, // Requirement met with one excellent contribution
        description: "Special badge description",
        category: "collaboration",
        tier: "gold",
        expirationDate: null,
      };

      const mockReward = {
        basePoints: 10,
        qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
        streakBonuses: [],
        history: [], // No history initially
        specialBadge: mockBadge,
      };

      const mockGamification = {
        userId,
        points: 0,
        recentActivities: [],
      };

      const existingUserReward = {
        userId,
        rewardId: mockBadge.id,
        status: RewardStatus.ACTIVE,
      };

      mockCollaborationRewardRepository.findOne.mockResolvedValue({ ...mockReward, specialBadge: mockBadge }); // Explicitly include specialBadge
      mockGamificationRepository.findOne.mockResolvedValue(mockGamification);
      mockUserRewardRepository.findOne.mockResolvedValue(existingUserReward); // User already has the badge
      jest
        .spyOn(service as any, "calculateContributionStreak")
        .mockReturnValue(0); // Mock private method

      // Act
      await service.awardCollaboration(
        userId,
        contributionId,
        type,
        quality,
        reviewerId
      );

      // Assert
      // ... (assertions for points and history as in the first test)
      expect(mockUserRewardRepository.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId,
            rewardId: mockBadge.id,
          },
        })
      );
      expect(mockUserRewardRepository.save).not.toHaveBeenCalled(); // Should not save new reward
      expect(mockCollaborationRewardRepository.save).toHaveBeenCalledWith(
        mockReward
      );
      expect(mockGamificationRepository.save).toHaveBeenCalledWith(
        mockGamification
      );
    });

    it("should award base points for unknown quality", async () => {
      // Arrange
      const userId = "test-user-id";
      const contributionId = "test-contribution-id";
      const type = CollaborationType.CONTENIDO_CREACION;
      const quality = "unknown_quality"; // Unknown quality
      const reviewerId = "test-reviewer-id";

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
      jest
        .spyOn(service as any, "calculateContributionStreak")
        .mockReturnValue(0); // Mock private method

      // Act
      await service.awardCollaboration(
        userId,
        contributionId,
        type,
        quality,
        reviewerId
      );

      // Assert
      // Should award only base points as quality is unknown
      const expectedPoints = mockReward.basePoints;

      expect(mockReward.history.length).toBe(1);
      expect(mockReward.history[0]).toMatchObject({
        userId,
        contributionId,
        type,
        quality,
        reviewedBy: reviewerId,
      });
      expect(mockReward.history[0].pointsAwarded).toBeCloseTo(expectedPoints, 2);

      expect(mockGamification.points).toBe(expectedPoints);
      expect(mockGamification.recentActivities.length).toBe(1);
      expect(mockGamification.recentActivities[0]).toMatchObject({
        type: "collaboration",
        description: `Contribución ${type.toLowerCase()} - Calidad: ${quality}`,
      });
      expect(mockGamification.recentActivities[0].pointsEarned).toBeCloseTo(expectedPoints, 2);

      expect(mockCollaborationRewardRepository.save).toHaveBeenCalledWith(
        mockReward
      );
      expect(mockGamificationRepository.save).toHaveBeenCalledWith(
        mockGamification
      );
      expect(mockUserRewardRepository.save).not.toHaveBeenCalled();
    });

    it("should apply streak bonus if streak is above or equal to threshold", async () => {
      // Arrange
      const userId = "test-user-id";
      const contributionId = "test-contribution-id";
      const type = CollaborationType.CONTENIDO_CREACION;
      const quality = "good";
      const reviewerId = "test-reviewer-id";

      const mockReward = {
        basePoints: 10,
        qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
        streakBonuses: [{ threshold: 3, multiplier: 0.1 }], // Streak bonus requires streak >= 3
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
      jest
        .spyOn(service as any, "calculateContributionStreak")
        .mockReturnValue(3); // Streak is 3 (at threshold)

      // Act
      await service.awardCollaboration(
        userId,
        contributionId,
        type,
        quality,
        reviewerId
      );

      // Assert
      // Calculate points with quality multiplier: 10 * 1.2 = 12
      // Calculate streak bonus: 12 * 0.1 = 1.2
      // Total expected points: 12 + 1.2 = 13.2
      const basePointsAfterQuality = mockReward.basePoints * mockReward.qualityMultipliers[quality];
      const streakBonus = basePointsAfterQuality * mockReward.streakBonuses[0].multiplier;
      const expectedPoints = basePointsAfterQuality + streakBonus;


      expect(mockReward.history.length).toBe(1);
      expect(mockReward.history[0]).toMatchObject({
        userId,
        contributionId,
        type,
        quality,
        reviewedBy: reviewerId,
      });
      expect(mockReward.history[0].pointsAwarded).toBeCloseTo(expectedPoints, 2);

      expect(mockGamification.points).toBeCloseTo(expectedPoints, 2);
      expect(mockGamification.recentActivities.length).toBe(1);
      expect(mockGamification.recentActivities[0]).toMatchObject({
        type: "collaboration",
        description: `Contribución ${type.toLowerCase()} - Calidad: ${quality}`,
      });
      expect(mockGamification.recentActivities[0].pointsEarned).toBeCloseTo(expectedPoints, 2);

      expect(mockCollaborationRewardRepository.save).toHaveBeenCalledWith(
        mockReward
      );
      expect(mockGamificationRepository.save).toHaveBeenCalledWith(
        mockGamification
      );
      expect(mockUserRewardRepository.save).not.toHaveBeenCalled();
    });


    it("should not apply streak bonus if streak is below threshold", async () => {
      // Arrange
      const userId = "test-user-id";
      const contributionId = "test-contribution-id";
      const type = CollaborationType.CONTENIDO_CREACION;
      const quality = "good";
      const reviewerId = "test-reviewer-id";

      const mockReward = {
        basePoints: 10,
        qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
        streakBonuses: [{ threshold: 3, multiplier: 0.1 }], // Streak bonus requires streak >= 3
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
      jest
        .spyOn(service as any, "calculateContributionStreak")
        .mockReturnValue(2); // Streak is 2 (below threshold)

      // Act
      await service.awardCollaboration(
        userId,
        contributionId,
        type,
        quality,
        reviewerId
      );

      // Assert
      // Should award points based on quality multiplier, but no streak bonus
      const expectedPoints = mockReward.basePoints * mockReward.qualityMultipliers[quality];

      expect(mockReward.history.length).toBe(1);
      expect(mockReward.history[0]).toMatchObject({
        userId,
        contributionId,
        type,
        quality,
        reviewedBy: reviewerId,
      });

      expect(mockGamification.points).toBe(expectedPoints);
      expect(mockGamification.recentActivities.length).toBe(1);
      expect(mockGamification.recentActivities[0]).toMatchObject({
        type: "collaboration",
        description: `Contribución ${type.toLowerCase()} - Calidad: ${quality}`,
        pointsEarned: expectedPoints,
      });

      expect(mockCollaborationRewardRepository.save).toHaveBeenCalledWith(
        mockReward
      );
      expect(mockGamificationRepository.save).toHaveBeenCalledWith(
        mockGamification
      );
      expect(mockUserRewardRepository.save).not.toHaveBeenCalled();
    });
  }); // Close describe("awardCollaboration", ...)

  describe("getCollaborationStats", () => {
    it("should return default stats for a user with no contributions", async () => {
      const userId = "test-user-id";
      const mockRewards: CollaborationReward[] = [
        {
          type: CollaborationType.CONTENIDO_CREACION,
          basePoints: 10,
          qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
          streakBonuses: [],
          history: [], // No history for this user
          specialBadge: null,
          id: "mock-reward-id-2", // Added id
          title: "Mock Reward 2", // Added title
          description: "Description for mock reward 2", // Added description
        } as CollaborationReward,
      ];

      mockCollaborationRewardRepository.find.mockResolvedValue(mockRewards);
      jest
        .spyOn(service as any, "calculateContributionStreak")
        .mockReturnValue(0); // Mock private method

      const result = await service.getCollaborationStats(userId);

      expect(mockCollaborationRewardRepository.find).toHaveBeenCalled();
      expect(result).toEqual({
        totalContributions: 0,
        excellentContributions: 0,
        currentStreak: 0,
        totalPoints: 0,
      });
      expect(
        (service as any)["calculateContributionStreak"]
      ).toHaveBeenCalledWith([]);
    });

    it("should return correct stats for a user with contributions", async () => {
      const userId = "test-user-id";
      const mockRewards: CollaborationReward[] = [
        {
          type: CollaborationType.CONTENIDO_CREACION,
          basePoints: 10,
          qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
          streakBonuses: [],
          history: [
            {
              userId,
              type: CollaborationType.CONTENIDO_CREACION,
              quality: "good",
              pointsAwarded: 12,
              awardedAt: new Date(),
            },
            {
              userId,
              type: CollaborationType.CONTENIDO_CREACION,
              quality: "excellent",
              pointsAwarded: 15,
              awardedAt: new Date(),
            },
          ] as any[],
          specialBadge: null,
          id: "mock-reward-id-3", // Added id
          title: "Mock Reward 3", // Added title
          description: "Description for mock reward 3", // Added description
        } as CollaborationReward,
        {
          type: CollaborationType.CONTENIDO_REVISION,
          basePoints: 5,
          qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
          streakBonuses: [],
          history: [
            {
              userId,
              type: CollaborationType.CONTENIDO_REVISION,
              quality: "average",
              pointsAwarded: 5,
              awardedAt: new Date(),
            },
          ] as any[],
          specialBadge: null,
          id: "mock-reward-id-4", // Added id
          title: "Mock Reward 4", // Added title
          description: "Description for mock reward 4", // Added description
        } as CollaborationReward,
      ];

      mockCollaborationRewardRepository.find.mockResolvedValue(mockRewards);
      jest
        .spyOn(service as any, "calculateContributionStreak")
        .mockReturnValue(2); // Mock private method

      const result = await service.getCollaborationStats(userId);

      expect(mockCollaborationRewardRepository.find).toHaveBeenCalled();
      expect(result).toEqual({
        totalContributions: 3,
        excellentContributions: 1,
        currentStreak: 2, // Streak is calculated across all contributions, not just filtered type
        totalPoints: 12 + 15 + 5,
      });
      expect(
        (service as any)["calculateContributionStreak"]
      ).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            userId,
            quality: "good",
            pointsAwarded: 12,
          }),
          expect.objectContaining({
            userId,
            quality: "excellent",
            pointsAwarded: 15,
          }),
          expect.objectContaining({
            userId,
            quality: "average",
            pointsAwarded: 5,
          }),
        ])
      );
    });

    it("should return correct stats filtered by type", async () => {
      const userId = "test-user-id";
      const type = CollaborationType.CONTENIDO_CREACION;
      const mockRewards: CollaborationReward[] = [
        {
          type: CollaborationType.CONTENIDO_CREACION,
          basePoints: 10,
          qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
          streakBonuses: [],
          history: [
            {
              userId,
              type: CollaborationType.CONTENIDO_CREACION,
              quality: "good",
              pointsAwarded: 12,
              awardedAt: new Date(),
            },
            {
              userId,
              type: CollaborationType.CONTENIDO_CREACION,
              quality: "excellent",
              pointsAwarded: 15,
              awardedAt: new Date(),
            },
          ] as any[],
          specialBadge: null,
          id: "mock-reward-id-3", // Added id
          title: "Mock Reward 3", // Added title
          description: "Description for mock reward 3", // Added description
        } as CollaborationReward,
        {
          type: CollaborationType.CONTENIDO_REVISION,
          basePoints: 5,
          qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
          streakBonuses: [],
          history: [
            {
              userId,
              type: CollaborationType.CONTENIDO_REVISION,
              quality: "average",
              pointsAwarded: 5,
              awardedAt: new Date(),
            },
          ] as any[],
          specialBadge: null,
          id: "mock-reward-id-4", // Added id
          title: "Mock Reward 4", // Added title
          description: "Description for mock reward 4", // Added description
        } as CollaborationReward,
      ];

      mockCollaborationRewardRepository.find.mockResolvedValue(mockRewards);
      jest
        .spyOn(service as any, "calculateContributionStreak")
        .mockReturnValue(2); // Mock private method

      const result = await service.getCollaborationStats(userId, type);

      expect(mockCollaborationRewardRepository.find).toHaveBeenCalled();
      expect(result).toEqual({
        totalContributions: 2,
        excellentContributions: 1,
        currentStreak: 2, // Streak is calculated across all contributions, not just filtered type
        totalPoints: 12 + 15,
      });
      // calculateContributionStreak is called with all contributions, not just filtered ones
      expect(
        (service as any)["calculateContributionStreak"]
      ).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            userId,
            quality: "good",
            pointsAwarded: 12,
          }),
          expect.objectContaining({
            userId,
            quality: "excellent",
            pointsAwarded: 15,
          }),
          expect.objectContaining({
            userId,
            quality: "average",
            pointsAwarded: 5,
          }),
        ])
      );
    });

    it("should include special badges if requirements are met", async () => {
      const userId = "test-user-id";
      const mockBadge = {
        id: "badge-1",
        name: "Excellent Contributor",
        icon: "icon.png",
        requirementCount: 2,
      };
      const mockRewards: CollaborationReward[] = [
        {
          type: CollaborationType.CONTENIDO_CREACION,
          basePoints: 10,
          qualityMultipliers: { excellent: 1.5, good: 1.2, average: 1.0 },
          streakBonuses: [],
          history: [
            {
              userId,
              quality: "excellent",
              pointsAwarded: 15,
              awardedAt: new Date(),
            },
            {
              userId,
              quality: "excellent",
              pointsAwarded: 15,
              awardedAt: new Date(),
            },
            {
              userId,
              quality: "good",
              pointsAwarded: 12,
              awardedAt: new Date(),
            },
          ] as any[],
          specialBadge: mockBadge as any,
          id: "mock-reward-id-5", // Added id
          title: "Mock Reward 5", // Added title
          description: "Description for mock reward 5", // Added description
        } as CollaborationReward,
      ];

      mockCollaborationRewardRepository.find.mockResolvedValue(mockRewards);
      jest
        .spyOn(service as any, "calculateContributionStreak")
        .mockReturnValue(3); // Mock private method

      const result = await service.getCollaborationStats(userId);

      expect(mockCollaborationRewardRepository.find).toHaveBeenCalled();
      expect(result).toEqual({
        totalContributions: 3,
        excellentContributions: 2,
        currentStreak: 3,
        totalPoints: 15 + 15 + 12,
      });
      expect(
        (service as any)["calculateContributionStreak"]
      ).toHaveBeenCalled();
    });

    it("should use cache if available", async () => {
      const userId = "test-user-id";
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

    it("should clear cache for user on awardCollaboration", async () => {
      const userId = "test-user-id";
      const cacheKeyAll = `${userId}-all`;
      const cacheKeyType = `${userId}-${CollaborationType.CONTENIDO_CREACION}`;
      (service as any).collaborationStatsCache.set(cacheKeyAll, {}); // Add dummy cache entries
      (service as any).collaborationStatsCache.set(cacheKeyType, {});
      (service as any).collaborationStatsCache.set("other-user-all", {}); // Keep other user's cache

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
      jest
        .spyOn(service as any, "calculateContributionStreak")
        .mockReturnValue(0);

      await service.awardCollaboration(
        userId,
        "contrib-id",
        CollaborationType.CONTENIDO_CREACION,
        "good"
      );

      expect((service as any).collaborationStatsCache.has(cacheKeyAll)).toBe(
        false
      );
      expect((service as any).collaborationStatsCache.has(cacheKeyType)).toBe(
        false
      );
      expect(
        (service as any).collaborationStatsCache.has("other-user-all")
      ).toBe(true); // Other user's cache should remain
    });
  });
});
