import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../../auth/entities/user.entity";
import { AchievementProgress } from "../entities/achievement-progress.entity";
import { CulturalAchievement } from "../entities/cultural-achievement.entity";
import { CulturalAchievementService } from "./cultural-achievement.service";
import { NotFoundException } from "@nestjs/common"; // Import NotFoundException

describe("CulturalAchievementService", () => {
  let service: CulturalAchievementService;
  let culturalAchievementRepository: Repository<CulturalAchievement>;
  let achievementProgressRepository: Repository<AchievementProgress>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CulturalAchievementService,
        {
          provide: getRepositoryToken(CulturalAchievement),
          useValue: {
            // Mock methods used in the service
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AchievementProgress),
          useValue: {
            // Mock methods used in the service
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            // Mock methods used in the service
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CulturalAchievementService>(
      CulturalAchievementService
    );
    culturalAchievementRepository = module.get<Repository<CulturalAchievement>>(
      getRepositoryToken(CulturalAchievement)
    );
    achievementProgressRepository = module.get<Repository<AchievementProgress>>(
      getRepositoryToken(AchievementProgress)
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createAchievement", () => {
    it("should create a new cultural achievement", async () => {
      const achievementData = {
        name: "Test Achievement",
        description: "A test achievement",
        category: "cultural", // Assuming AchievementCategory is string or enum
        type: "completion", // Assuming AchievementType is string or enum
        tier: "bronze", // Assuming AchievementTier is string or enum
        requirements: [
          { type: "lessons", value: 1, description: "Complete 1 lesson" },
        ],
        pointsReward: 50,
      };
      const createdAchievement = { id: "1", ...achievementData };

      (culturalAchievementRepository.create as jest.Mock).mockReturnValue(
        achievementData
      );
      (culturalAchievementRepository.save as jest.Mock).mockResolvedValue(
        createdAchievement
      );

      const result = await service.createAchievement(
        achievementData.name,
        achievementData.description,
        achievementData.category as any, // Cast to any for mock
        achievementData.type as any, // Cast to any for mock
        achievementData.tier as any, // Cast to any for mock
        achievementData.requirements,
        achievementData.pointsReward
      );

      expect(culturalAchievementRepository.create).toHaveBeenCalled();
      expect(culturalAchievementRepository.save).toHaveBeenCalledWith(
        achievementData
      );
      expect(result).toEqual(createdAchievement);
    });
  });

  describe("getAchievements", () => {
    it("should return all cultural achievements if no filters are provided", async () => {
      const achievements = [
        { id: "1", name: "Ach1" },
        { id: "2", name: "Ach2" },
      ];
      (culturalAchievementRepository.find as jest.Mock).mockResolvedValue(
        achievements
      );

      const result = await service.getAchievements();

      expect(culturalAchievementRepository.find).toHaveBeenCalledWith({
        where: {},
      });
      expect(result).toEqual(achievements);
    });

    it("should return cultural achievements filtered by category", async () => {
      const category = "cultural";
      const achievements = [{ id: "1", name: "Ach1", category: category }];
      (culturalAchievementRepository.find as jest.Mock).mockResolvedValue(
        achievements
      );

      const result = await service.getAchievements(category as any); // Cast to any for mock

      expect(culturalAchievementRepository.find).toHaveBeenCalledWith({
        where: { category: category },
      });
      expect(result).toEqual(achievements);
    });

    it("should return cultural achievements filtered by type", async () => {
      const type = "completion";
      const achievements = [{ id: "1", name: "Ach1", type: type }];
      (culturalAchievementRepository.find as jest.Mock).mockResolvedValue(
        achievements
      );

      const result = await service.getAchievements(undefined, type as any); // Cast to any for mock

      expect(culturalAchievementRepository.find).toHaveBeenCalledWith({
        where: { type: type },
      });
      expect(result).toEqual(achievements);
    });

    it("should return cultural achievements filtered by category and type", async () => {
      const category = "cultural";
      const type = "completion";
      const achievements = [
        { id: "1", name: "Ach1", category: category, type: type },
      ];
      (culturalAchievementRepository.find as jest.Mock).mockResolvedValue(
        achievements
      );

      const result = await service.getAchievements(
        category as any,
        type as any
      ); // Cast to any for mock

      expect(culturalAchievementRepository.find).toHaveBeenCalledWith({
        where: { category: category, type: type },
      });
      expect(result).toEqual(achievements);
    });
  });

  describe("initializeUserProgress", () => {
    it("should initialize achievement progress for a user", async () => {
      const userId = "1";
      const achievementId = "1";
      const mockUser = { id: userId } as User;
      const mockAchievement = { id: achievementId } as CulturalAchievement;
      const mockProgress = {
        user: mockUser,
        achievement: mockAchievement,
        progress: [],
        percentageCompleted: 0,
      } as AchievementProgress;

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (culturalAchievementRepository.findOne as jest.Mock).mockResolvedValue(
        mockAchievement
      );
      (achievementProgressRepository.create as jest.Mock).mockReturnValue(
        mockProgress
      );
      (achievementProgressRepository.save as jest.Mock).mockResolvedValue(
        mockProgress
      );

      const result = await service.initializeUserProgress(
        userId,
        achievementId
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(culturalAchievementRepository.findOne).toHaveBeenCalledWith({
        where: { id: achievementId },
      });
      expect(achievementProgressRepository.create).toHaveBeenCalled();
      expect(achievementProgressRepository.save).toHaveBeenCalledWith(
        mockProgress
      );
      expect(result).toEqual(mockProgress);
    });

    it("should throw an error if user is not found", async () => {
      const userId = "1";
      const achievementId = "1";

      (userRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(
        service.initializeUserProgress(userId, achievementId)
      ).rejects.toThrowError(`User with ID ${userId} not found`);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(culturalAchievementRepository.findOne).not.toHaveBeenCalled();
      expect(achievementProgressRepository.create).not.toHaveBeenCalled();
      expect(achievementProgressRepository.save).not.toHaveBeenCalled();
    });

    it("should throw an error if achievement is not found", async () => {
      const userId = "1";
      const achievementId = "1";
      const mockUser = { id: userId } as User;

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (culturalAchievementRepository.findOne as jest.Mock).mockResolvedValue(
        undefined
      );

      await expect(
        service.initializeUserProgress(userId, achievementId)
      ).rejects.toThrowError(
        `CulturalAchievement with ID ${achievementId} not found`
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(culturalAchievementRepository.findOne).toHaveBeenCalledWith({
        where: { id: achievementId },
      });
      expect(achievementProgressRepository.create).not.toHaveBeenCalled();
      expect(achievementProgressRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("updateProgress", () => {
    it("should update achievement progress for a user", async () => {
      const userId = '1';
      const achievementId = '1';
      const progressUpdates = [
        { requirementType: "lessons", currentValue: 2, targetValue: 5 },
      ]; // Corrected structure
      const mockUser = { id: userId, points: 100 } as User;
      const mockAchievement = {
        id: achievementId,
        pointsReward: 50,
      } as CulturalAchievement;
      const mockProgress = {
        id: "some-id-1", // Added missing property
        milestones: [], // Added missing property
        createdAt: new Date(), // Added missing property
        updatedAt: new Date(), // Added missing property
        user: mockUser,
        achievement: mockAchievement,
        progress: [
          {
            requirementType: "lessons",
            currentValue: 1,
            targetValue: 5,
            lastUpdated: expect.any(Date),
          },
        ], // Corrected structure and used expect.any(Date)
        percentageCompleted: 0,
        isCompleted: false,
      } as AchievementProgress;
      // The updatedProgress mock should reflect the state after applying progressUpdates
      // Assuming the service updates the existing progress entry and calculates percentage
      const updatedProgress = {
        ...mockProgress,
        progress: [
          {
            requirementType: "lessons",
            currentValue: 2,
            targetValue: 5,
            lastUpdated: expect.any(Date),
          },
        ],
        percentageCompleted: 0,
      }; // Corrected structure and used expect.any(Date)

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (culturalAchievementRepository.findOne as jest.Mock).mockResolvedValue(
        mockAchievement
      );
      (achievementProgressRepository.findOne as jest.Mock).mockResolvedValue(
        mockProgress
      );
      (achievementProgressRepository.save as jest.Mock).mockResolvedValue(
        updatedProgress
      );
      jest.spyOn(service, "calculatePercentageCompleted").mockReturnValue(0);

      const result = await service.updateProgress(
        userId,
        achievementId,
        progressUpdates
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(culturalAchievementRepository.findOne).toHaveBeenCalledWith({
        where: { id: achievementId },
      });
      expect(achievementProgressRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { id: userId },
          achievement: { id: achievementId },
        },
      });
      // Expect calculatePercentageCompleted to be called with the updated progress array including lastUpdated
      expect(service.calculatePercentageCompleted).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            requirementType: "lessons",
            currentValue: 2,
            targetValue: 5,
            lastUpdated: expect.any(Date),
          }),
        ])
      );
      expect(achievementProgressRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updatedProgress,
          progress: expect.arrayContaining([
            expect.objectContaining({
              requirementType: "lessons",
              currentValue: 2,
              targetValue: 5,
              lastUpdated: expect.any(Date),
            }),
          ]),
        })
      );
      expect(userRepository.save).not.toHaveBeenCalled(); // User points should not be updated yet
      expect(result).toEqual(updatedProgress);
    });

    it("should complete achievement and award points if progress reaches 100%", async () => {
      const userId = "1";
      const achievementId = "1";
      const progressUpdates = [
        { requirementType: "lessons", currentValue: 5, targetValue: 5 },
      ]; // Corrected structure
      const mockUser = { id: userId, points: 100 } as User;
      const mockAchievement = {
        id: achievementId,
        pointsReward: 50,
      } as CulturalAchievement;
      const mockProgress = {
        id: "some-id-2",
        milestones: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        user: mockUser,
        achievement: mockAchievement,
        progress: [
          {
            requirementType: "lessons",
            currentValue: 4,
            targetValue: 5,
            lastUpdated: new Date(),
          },
        ], // Corrected structure
        percentageCompleted: 0,
        isCompleted: false,
      } as AchievementProgress;
      // The completedProgress mock should reflect the state after applying progressUpdates
      // Assuming the service updates the existing progress entry and marks as completed
      const completedProgress = {
        ...mockProgress,
        progress: [
          {
            requirementType: "lessons",
            currentValue: 5,
            targetValue: 5,
            lastUpdated: expect.any(Date),
          },
        ],
        percentageCompleted: 100,
        isCompleted: true,
      }; // Corrected structure and used expect.any(Date)
      const userAfterAward = {
        ...mockUser,
        points: mockUser.points + mockAchievement.pointsReward,
      };

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (culturalAchievementRepository.findOne as jest.Mock).mockResolvedValue(
        mockAchievement
      );
      (achievementProgressRepository.findOne as jest.Mock).mockResolvedValue(
        mockProgress
      );
      (achievementProgressRepository.save as jest.Mock).mockResolvedValue(
        completedProgress
      );
      (userRepository.save as jest.Mock).mockResolvedValue(userAfterAward);
      jest.spyOn(service, "calculatePercentageCompleted").mockReturnValue(100);

      const result = await service.updateProgress(
        userId,
        achievementId,
        progressUpdates
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(culturalAchievementRepository.findOne).toHaveBeenCalledWith({
        where: { id: achievementId },
      });
      expect(achievementProgressRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { id: userId },
          achievement: { id: achievementId },
        },
      });
      // Expect calculatePercentageCompleted to be called with the updated progress array including lastUpdated
      expect(service.calculatePercentageCompleted).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            requirementType: "lessons",
            currentValue: 5,
            targetValue: 5,
            lastUpdated: expect.any(Date),
          }),
        ])
      );
      expect(achievementProgressRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...completedProgress,
          progress: expect.arrayContaining([
            expect.objectContaining({
              requirementType: "lessons",
              currentValue: 5,
              targetValue: 5,
              lastUpdated: expect.any(Date),
            }),
          ]),
        })
      );
      expect(userRepository.save).toHaveBeenCalledWith(userAfterAward); // User points should be updated
      expect(result).toEqual(completedProgress);
    });

    it("should not award points if achievement is already completed", async () => {
      const userId = "1";
      const achievementId = "1";
      const progressUpdates = [
        { requirementType: "lessons", currentValue: 5, targetValue: 5 },
      ]; // Corrected structure
      const mockUser = { id: userId, points: 100 } as User;
      const mockAchievement = {
        id: achievementId,
        pointsReward: 50,
      } as CulturalAchievement;
      const mockProgress = {
        id: "some-id-3",
        milestones: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        user: mockUser,
        achievement: mockAchievement,
        progress: [
          {
            requirementType: "lessons",
            currentValue: 5,
            targetValue: 5,
            lastUpdated: expect.any(Date),
          },
        ], // Corrected structure and used expect.any(Date)
        percentageCompleted: 100,
        isCompleted: true,
      } as AchievementProgress;
      // The updatedProgress mock should reflect the state after applying progressUpdates
      // Assuming the service updates the existing progress entry (even though it's already completed)
      const updatedProgress = {
        ...mockProgress,
        progress: [
          {
            requirementType: "lessons",
            currentValue: 5,
            targetValue: 5,
            lastUpdated: expect.any(Date),
          },
        ],
      }; // Corrected structure and removed unnecessary map/any cast

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (culturalAchievementRepository.findOne as jest.Mock).mockResolvedValue(
        mockAchievement
      );
      (achievementProgressRepository.findOne as jest.Mock).mockResolvedValue(
        mockProgress
      );
      (achievementProgressRepository.save as jest.Mock).mockResolvedValue(
        updatedProgress
      );
      jest.spyOn(service, "calculatePercentageCompleted").mockReturnValue(100); // Still 100%

      const result = await service.updateProgress(
        userId,
        achievementId,
        progressUpdates
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(culturalAchievementRepository.findOne).toHaveBeenCalledWith({
        where: { id: achievementId },
      });
      expect(achievementProgressRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { id: userId },
          achievement: { id: achievementId },
        },
      });
      // Expect calculatePercentageCompleted to be called with the updated progress array including lastUpdated
      expect(service.calculatePercentageCompleted).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            requirementType: "lessons",
            currentValue: 5,
            targetValue: 5,
            lastUpdated: expect.any(Date),
          }),
        ])
      );
      expect(achievementProgressRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updatedProgress,
          progress: expect.arrayContaining([
            expect.objectContaining({
              requirementType: "lessons",
              currentValue: 5,
              targetValue: 5,
              lastUpdated: expect.any(Date),
            }),
          ]),
        })
      );
      expect(userRepository.save).not.toHaveBeenCalled(); // User points should NOT be updated
      expect(result).toEqual(updatedProgress);
    });

    it("should throw an error if user is not found", async () => {
      const userId = "1";
      const achievementId = "1";
      const progressUpdates = [
        { requirementType: "lessons", currentValue: 2, targetValue: 5 },
      ]; // Corrected structure

      (userRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(
        service.updateProgress(userId, achievementId, progressUpdates)
      ).rejects.toThrowError(`User with ID ${userId} not found`);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(culturalAchievementRepository.findOne).not.toHaveBeenCalled();
      expect(achievementProgressRepository.findOne).not.toHaveBeenCalled();
      expect(achievementProgressRepository.save).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it("should throw an error if achievement is not found", async () => {
      const userId = "1";
      const achievementId = "1";
      const progressUpdates = [
        { requirementType: "lessons", currentValue: 2, targetValue: 5 },
      ]; // Corrected structure
      const mockUser = { id: userId } as User;

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (culturalAchievementRepository.findOne as jest.Mock).mockResolvedValue(
        undefined
      );

      await expect(
        service.updateProgress(userId, achievementId, progressUpdates)
      ).rejects.toThrowError(
        `CulturalAchievement with ID ${achievementId} not found`
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(culturalAchievementRepository.findOne).toHaveBeenCalledWith({
        where: { id: achievementId },
      });
      expect(achievementProgressRepository.findOne).not.toHaveBeenCalled();
      expect(achievementProgressRepository.save).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it("should throw an error if achievement progress is not found", async () => {
      const userId = "1";
      const achievementId = "1";
      const progressUpdates = [
        { requirementType: "lessons", currentValue: 2, targetValue: 5 },
      ]; // Corrected structure
      const mockUser = { id: userId } as User;
      const mockAchievement = { id: achievementId } as CulturalAchievement;

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (culturalAchievementRepository.findOne as jest.Mock).mockResolvedValue(
        mockAchievement
      );
      (achievementProgressRepository.findOne as jest.Mock).mockResolvedValue(
        undefined
      );

      await expect(
        service.updateProgress(userId, achievementId, progressUpdates)
      ).rejects.toThrowError(
        `AchievementProgress not found for user ID ${userId} and achievement ID ${achievementId}`,
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(culturalAchievementRepository.findOne).toHaveBeenCalledWith({
        where: { id: achievementId },
      });
      expect(achievementProgressRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { id: userId },
          achievement: { id: achievementId },
        },
      });
      expect(achievementProgressRepository.save).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it("should throw NotFoundException if achievement progress is not found for update", async () => {
      const userId = "1";
      const achievementId = "1";
      const progressUpdates = [
        { requirementType: "lessons", currentValue: 2, targetValue: 5 },
      ];

      (userRepository.findOne as jest.Mock).mockResolvedValue({
        id: userId,
      } as User);
      (culturalAchievementRepository.findOne as jest.Mock).mockResolvedValue({
        id: achievementId,
      } as CulturalAchievement);
      (achievementProgressRepository.findOne as jest.Mock).mockResolvedValue(
        undefined
      ); // Progress not found

      await expect(
        service.updateProgress(userId, achievementId, progressUpdates)
      ).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(culturalAchievementRepository.findOne).toHaveBeenCalledWith({
        where: { id: achievementId },
      });
      expect(achievementProgressRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { id: userId },
          achievement: { id: achievementId },
        },
      });
      expect(achievementProgressRepository.save).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("getUserAchievements", () => {
    it("should return empty arrays for completed and in-progress achievements if user has no progress", async () => {
      const userId = "1";
      const mockUser = { id: userId } as User;

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (achievementProgressRepository.find as jest.Mock)
        .mockResolvedValueOnce([]) // Mock for completed achievements
        .mockResolvedValueOnce([]); // Mock for in-progress achievements

      const result = await service.getUserAchievements(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(achievementProgressRepository.find).toHaveBeenCalledWith({
        where: {
          user: { id: userId.toString() },
          isCompleted: true,
        },
        relations: ["achievement"],
      });
      expect(achievementProgressRepository.find).toHaveBeenCalledWith({
        where: {
          user: { id: userId.toString() },
          isCompleted: false,
        },
        relations: ["achievement"],
      });
      expect(result).toEqual({ completed: [], inProgress: [] });
    });

    it("should return completed and in-progress achievements for a user with progress", async () => {
      const userId = "1";
      const mockUser = { id: userId } as User;

      const mockCompletedAchievement = {
        id: "ach-c1",
        name: "Completed Ach",
      } as CulturalAchievement;
      const mockInProgressAchievement = {
        id: "ach-ip1",
        name: "In Progress Ach",
      } as CulturalAchievement;

      const mockCompletedProgress = [
        {
          user: mockUser,
          achievement: mockCompletedAchievement,
          isCompleted: true,
        },
      ] as AchievementProgress[];
      const mockInProgressProgress = [
        {
          user: mockUser,
          achievement: mockInProgressAchievement,
          isCompleted: false,
        },
      ] as AchievementProgress[];

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      // Mock find for completed achievements first, then for in-progress
      (achievementProgressRepository.find as jest.Mock)
        .mockResolvedValueOnce(mockCompletedProgress)
        .mockResolvedValueOnce(mockInProgressProgress);

      const result = await service.getUserAchievements(userId);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(achievementProgressRepository.find).toHaveBeenCalledWith({
        where: {
          user: { id: userId.toString() },
          isCompleted: true,
        },
        relations: ["achievement"],
      });
      expect(achievementProgressRepository.find).toHaveBeenCalledWith({
        where: {
          user: { id: userId.toString() },
          isCompleted: false,
        },
        relations: ["achievement"],
      });
      expect(result.completed).toEqual([mockCompletedAchievement]);
      expect(result.inProgress).toEqual([mockInProgressAchievement]);
    });
  });

  describe("getAchievementProgress", () => {
    it("should return undefined if achievement progress is not found for a user", async () => {
      const userId = "1";
      const achievementId = "1";
      const mockUser = { id: userId } as User;
      const mockAchievement = { id: achievementId } as CulturalAchievement;

      // Mock findOne for user and achievement to return values
      (userRepository.findOne as jest.Mock).mockResolvedValue({ id: userId });
      (culturalAchievementRepository.findOne as jest.Mock).mockResolvedValue(
        mockAchievement
      ); // Mock achievement existence check
      (achievementProgressRepository.findOne as jest.Mock).mockResolvedValue(
        undefined
      ); // Progress not found

      const result = await service.getAchievementProgress(
        userId,
        achievementId
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(culturalAchievementRepository.findOne).toHaveBeenCalledWith({
        where: { id: achievementId },
      });
      expect(achievementProgressRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { id: userId },
          achievement: { id: achievementId },
        },
      });
      expect(result).toBeUndefined();
    });

    it("should return achievement progress if found for a user", async () => {
      const userId = "1";
      const achievementId = "1";
      const mockUser = { id: userId } as User;
      const mockAchievement = { id: achievementId } as CulturalAchievement;
      const mockProgress = {
        id: "some-id",
        user: mockUser,
        achievement: mockAchievement,
        progress: [],
        percentageCompleted: 0,
        isCompleted: false,
      } as AchievementProgress;

      // Mock findOne for user, achievement, and achievement progress to return values
      (userRepository.findOne as jest.Mock).mockResolvedValue({ id: userId });
      (culturalAchievementRepository.findOne as jest.Mock).mockResolvedValue(
        mockAchievement
      );
      (achievementProgressRepository.findOne as jest.Mock).mockResolvedValue(
        mockProgress
      );

      const result = await service.getAchievementProgress(
        userId,
        achievementId
      );

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(culturalAchievementRepository.findOne).toHaveBeenCalledWith({
        where: { id: achievementId },
      });
      expect(achievementProgressRepository.findOne).toHaveBeenCalledWith({
        where: {
          user: { id: userId },
          achievement: { id: achievementId },
        },
      });
      expect(result).toEqual(mockProgress);
    });

    it("should throw NotFoundException if user is not found", async () => {
      const userId = "1";
      const achievementId = "1";

      (userRepository.findOne as jest.Mock).mockResolvedValue(undefined); // User not found

      await expect(
        service.getAchievementProgress(userId, achievementId)
      ).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(culturalAchievementRepository.findOne).not.toHaveBeenCalled(); // Should not call findOne on achievement if user not found
      expect(achievementProgressRepository.findOne).not.toHaveBeenCalled(); // Should not call findOne on progress if user not found
    });

    it("should throw NotFoundException if achievement is not found", async () => {
      const userId = "1";
      const achievementId = "1";
      const mockUser = { id: userId } as User;

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (culturalAchievementRepository.findOne as jest.Mock).mockResolvedValue(
        undefined
      ); // Achievement not found

      await expect(
        service.getAchievementProgress(userId, achievementId)
      ).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(culturalAchievementRepository.findOne).toHaveBeenCalledWith({
        where: { id: achievementId },
      });
      expect(achievementProgressRepository.findOne).not.toHaveBeenCalled(); // Should not call findOne on progress if achievement not found
    });
  });

  describe("calculatePercentageCompleted", () => {
    // No need to spy on the private method here, we can test it directly
    it("should return 0 for an empty progress array", () => {
      const progressEntries: any[] = [];
      const result = service["calculatePercentageCompleted"](progressEntries); // Access private method
      expect(result).toBe(0);
    });

    it("should return 0 if not all requirements are met", () => {
      const progressEntries = [
        { requirementType: "lessons", currentValue: 1, targetValue: 5 },
        { requirementType: "exercises", currentValue: 10, targetValue: 10 },
      ];
      const result = service["calculatePercentageCompleted"](progressEntries); // Access private method
      expect(result).toBe(0);
    });

    it("should return 100 if all requirements are met", () => {
      const progressEntries = [
        { requirementType: "lessons", currentValue: 5, targetValue: 5 },
        { requirementType: "exercises", currentValue: 10, targetValue: 10 },
      ];
      const result = service["calculatePercentageCompleted"](progressEntries); // Access private method
      expect(result).toBe(100);
    });

    it("should return 100 if current value exceeds target value", () => {
      const progressEntries = [
        { requirementType: "lessons", currentValue: 6, targetValue: 5 },
        { requirementType: "exercises", currentValue: 10, targetValue: 10 },
      ];
      const result = service["calculatePercentageCompleted"](progressEntries); // Access private method
      expect(result).toBe(100);
    });
  });

  it("should update achievement progress with multiple updates and update lastUpdated timestamp", async () => {
    const userId = "1";
    const achievementId = "1";
    const progressUpdates = [
      { requirementType: "lessons", currentValue: 3, targetValue: 5 },
      { requirementType: "exercises", currentValue: 7, targetValue: 10 },
    ];
    const mockUser = { id: userId, points: 100 } as User;
    const mockAchievement = {
      id: achievementId,
      pointsReward: 50,
    } as CulturalAchievement;
    const mockProgress = {
      id: "some-id-4",
      milestones: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      user: mockUser,
      achievement: mockAchievement,
      progress: [
        {
          requirementType: "lessons",
          currentValue: 2,
          targetValue: 5,
          lastUpdated: new Date("2023-01-01"), // Old timestamp
        },
        {
          requirementType: "exercises",
          currentValue: 5,
          targetValue: 10,
          lastUpdated: new Date("2023-01-01"), // Old timestamp
        },
      ],
      percentageCompleted: 0,
      isCompleted: false,
    } as AchievementProgress;

    (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
    (culturalAchievementRepository.findOne as jest.Mock).mockResolvedValue(
      mockAchievement
    );
    (achievementProgressRepository.findOne as jest.Mock).mockResolvedValue(
      mockProgress
    );
    (achievementProgressRepository.save as jest.Mock).mockImplementation(
      (progressToSave) => Promise.resolve(progressToSave)
    ); // Return the saved object
    jest.spyOn(service, "calculatePercentageCompleted").mockReturnValue(0); // Still not completed

    const result = await service.updateProgress(
      userId,
      achievementId,
      progressUpdates
    );

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { id: userId },
    });
    expect(culturalAchievementRepository.findOne).toHaveBeenCalledWith({
      where: { id: achievementId },
    });
    expect(achievementProgressRepository.findOne).toHaveBeenCalledWith({
      where: {
        user: { id: userId },
        achievement: { id: achievementId },
      },
    });
    expect(service.calculatePercentageCompleted).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          requirementType: "lessons",
          currentValue: 3,
          targetValue: 5,
          lastUpdated: expect.any(Date), // Check for updated timestamp
        }),
        expect.objectContaining({
          requirementType: "exercises",
          currentValue: 7,
          targetValue: 10,
          lastUpdated: expect.any(Date), // Check for updated timestamp
        }),
      ])
    );
    expect(achievementProgressRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        progress: expect.arrayContaining([
          expect.objectContaining({
            requirementType: "lessons",
            currentValue: 3,
            targetValue: 5,
            lastUpdated: expect.any(Date),
          }),
          expect.objectContaining({
            requirementType: "exercises",
            currentValue: 7,
            targetValue: 10,
            lastUpdated: expect.any(Date),
          }),
        ]),
      })
    );
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(result.progress.find(p => p.requirementType === 'lessons').currentValue).toBe(3);
    expect(result.progress.find(p => p.requirementType === 'exercises').currentValue).toBe(7);
    expect(result.progress.find(p => p.requirementType === 'lessons').lastUpdated).toEqual(expect.any(Date));
    expect(result.progress.find(p => p.requirementType === 'exercises').lastUpdated).toEqual(expect.any(Date));
  });

  it("should complete achievement but not award points if pointsReward is 0", async () => {
    const userId = "1";
    const achievementId = "1";
    const progressUpdates = [
      { requirementType: "lessons", currentValue: 5, targetValue: 5 },
    ];
    const mockUser = { id: userId, points: 100 } as User;
    const mockAchievement = {
      id: achievementId,
      pointsReward: 0, // Points reward is 0
    } as CulturalAchievement;
    const mockProgress = {
      id: "some-id-5",
      milestones: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      user: mockUser,
      achievement: mockAchievement,
      progress: [
        {
          requirementType: "lessons",
          currentValue: 4,
          targetValue: 5,
          lastUpdated: new Date(),
        },
      ],
      percentageCompleted: 0,
      isCompleted: false,
    } as AchievementProgress;
    const completedProgress = {
      ...mockProgress,
      progress: [
        {
          requirementType: "lessons",
          currentValue: 5,
          targetValue: 5,
          lastUpdated: expect.any(Date),
        },
      ],
      percentageCompleted: 100,
      isCompleted: true,
    };

    (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
    (culturalAchievementRepository.findOne as jest.Mock).mockResolvedValue(
      mockAchievement
    );
    (achievementProgressRepository.findOne as jest.Mock).mockResolvedValue(
      mockProgress
    );
    (achievementProgressRepository.save as jest.Mock).mockResolvedValue(
      completedProgress
    );
    (userRepository.save as jest.Mock).mockResolvedValue(mockUser); // User points should not change
    jest.spyOn(service, "calculatePercentageCompleted").mockReturnValue(100);

    const result = await service.updateProgress(
      userId,
      achievementId,
      progressUpdates
    );

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { id: userId },
    });
    expect(culturalAchievementRepository.findOne).toHaveBeenCalledWith({
      where: { id: achievementId },
    });
    expect(achievementProgressRepository.findOne).toHaveBeenCalledWith({
      where: {
        user: { id: userId },
        achievement: { id: achievementId },
      },
    });
    expect(service.calculatePercentageCompleted).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          requirementType: "lessons",
          currentValue: 5,
          targetValue: 5,
          lastUpdated: expect.any(Date),
        }),
      ])
    );
    expect(achievementProgressRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        ...completedProgress,
        progress: expect.arrayContaining([
          expect.objectContaining({
            requirementType: "lessons",
            currentValue: 5,
            targetValue: 5,
            lastUpdated: expect.any(Date),
          }),
        ]),
      })
    );
    expect(userRepository.save).not.toHaveBeenCalled(); // User points should NOT be updated
    expect(result).toEqual(completedProgress);
  });
});
