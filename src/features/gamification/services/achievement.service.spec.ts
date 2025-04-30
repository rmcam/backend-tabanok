import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AchievementDto, AchievementType } from "../dto/achievement.dto"; // Import AchievementType
import { Achievement } from "../entities/achievement.entity";
import { Badge } from "../entities/badge.entity";
import { Gamification } from "../entities/gamification.entity";
import { AchievementService } from "./achievement.service";

describe("AchievementService", () => {
  let service: AchievementService;
  let achievementRepository: Repository<Achievement>;
  let gamificationRepository: Repository<Gamification>;
  let badgeRepository: Repository<Badge>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementService,
        {
          provide: getRepositoryToken(Achievement),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Gamification),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Badge),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AchievementService>(AchievementService);
    achievementRepository = module.get<Repository<Achievement>>(
      getRepositoryToken(Achievement)
    );
    gamificationRepository = module.get<Repository<Gamification>>(
      getRepositoryToken(Gamification)
    );
    badgeRepository = module.get<Repository<Badge>>(getRepositoryToken(Badge));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("createAchievement", () => {
    it("should create a new achievement", async () => {
      const achievementDto: AchievementDto = {
        name: "Test Achievement",
        description: "Description",
        type: AchievementType.LEVEL_REACHED,
        requirement: 1,
        bonusPoints: 10,
        badge: null,
      };
      // Mock the entity structure returned by repository.create
      const createdAchievement: Achievement = {
        id: "1",
        name: achievementDto.name,
        description: achievementDto.description,
        criteria: achievementDto.type, // Use criteria for entity mock
        requirement: achievementDto.requirement,
        bonusPoints: achievementDto.bonusPoints,
        badge: achievementDto.badge,
        userAchievements: [],
        iconUrl: "",
      };

      jest
        .spyOn(achievementRepository, "create")
        .mockReturnValue(createdAchievement as Achievement);
      jest
        .spyOn(achievementRepository, "save")
        .mockResolvedValue(createdAchievement as Achievement);

      const result = await service.createAchievement(achievementDto);
      expect(result).toEqual(createdAchievement);
      expect(achievementRepository.create).toHaveBeenCalledWith(achievementDto);
      expect(achievementRepository.save).toHaveBeenCalledWith(
        createdAchievement
      );
    });
  });

  describe("updateAchievement", () => {
    it("should update an existing achievement", async () => {
      const achievementId = "1";
      const achievementDto: AchievementDto = {
        name: "Updated Achievement",
        description: "Updated Description",
        type: AchievementType.LESSONS_COMPLETED, // Use type for DTO
        requirement: 5,
        bonusPoints: 20,
        badge: null,
      };
      const existingAchievement: Achievement = {
        id: achievementId,
        name: "Old Name",
        description: "Old Desc",
        criteria: AchievementType.LEVEL_REACHED, // Use criteria for entity mock
        requirement: 1,
        bonusPoints: 10,
        badge: null,
        userAchievements: [],
        iconUrl: "",
      };
      // Mock the updated entity structure
      const updatedAchievement: Achievement = {
        ...existingAchievement,
        name: achievementDto.name,
        description: achievementDto.description,
        criteria: achievementDto.type, // Map DTO type to entity criteria
        requirement: achievementDto.requirement,
        bonusPoints: achievementDto.bonusPoints,
        badge: achievementDto.badge,
      };

      jest
        .spyOn(achievementRepository, "findOne")
        .mockResolvedValue(existingAchievement as Achievement);
      jest
        .spyOn(achievementRepository, "save")
        .mockResolvedValue(updatedAchievement as Achievement);

      const result = await service.updateAchievement(
        achievementId,
        achievementDto
      );
      expect(result).toEqual(updatedAchievement);
      expect(achievementRepository.findOne).toHaveBeenCalledWith({
        where: { id: achievementId },
      });
      expect(achievementRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(achievementDto)
      );
    });

    it("should throw an error if achievement not found", async () => {
      const achievementId = "non-existent-id";
      const achievementDto: AchievementDto = {
        name: "Updated Achievement",
        description: "Updated Description",
        type: AchievementType.LESSONS_COMPLETED, // Use type for DTO
        requirement: 5,
        bonusPoints: 20,
        badge: null,
      };

      jest.spyOn(achievementRepository, "findOne").mockResolvedValue(undefined);

      await expect(
        service.updateAchievement(achievementId, achievementDto)
      ).rejects.toThrowError(`Achievement with id ${achievementId} not found`);
      expect(achievementRepository.findOne).toHaveBeenCalledWith({
        where: { id: achievementId },
      });
    });
  });

  describe("checkAndAwardAchievements", () => {
    it("should check and award achievements for a user", async () => {
      const userId = "user1";
      const gamification: Gamification = {
        // Added type annotation
        userId,
        achievements: [],
        badges: [],
        points: 0,
        experience: 0,
        level: 0,
        nextLevelExperience: 200, // Added missing property
        stats: {
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
          learningStreak: 0,
          culturalContributions: 0,
        },
        recentActivities: [],
        activeMissions: [], // Added missing property
        culturalAchievements: [], // Added missing property
        createdAt: new Date(), // Added missing property
        updatedAt: new Date(), // Added missing property
        user: null, // Added missing property
        id: "gamification1", // Added missing property
      };
      const achievements: Achievement[] = [
        // Added type annotation
        {
          id: "ach1",
          name: "Level 1",
          description: "Test Description", // Added description
          criteria: AchievementType.LEVEL_REACHED, // Use criteria for entity mock
          requirement: 1,
          bonusPoints: 10,
          badge: null,
          userAchievements: [],
          iconUrl: "",
        },
        {
          id: "ach2",
          name: "Complete 1 Lesson",
          description: "Test Description", // Added description
          criteria: AchievementType.LESSONS_COMPLETED, // Use criteria for entity mock
          requirement: 1,
          bonusPoints: 10,
          badge: null,
          userAchievements: [],
          iconUrl: "",
        },
      ];

      jest
        .spyOn(gamificationRepository, "findOne")
        .mockResolvedValue(gamification as Gamification);
      jest
        .spyOn(achievementRepository, "find")
        .mockResolvedValue(achievements as Achievement[]);
      jest
        .spyOn(service as any, "checkAchievementCompletion")
        .mockResolvedValue(true); // Mock completion check
      jest
        .spyOn(service as any, "awardAchievement")
        .mockResolvedValue(undefined); // Mock award achievement

      await service.checkAndAwardAchievements(userId);

      expect(gamificationRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
        relations: ["achievements", "badges"],
      });
      expect(achievementRepository.find).toHaveBeenCalled();
      expect(service["checkAchievementCompletion"]).toHaveBeenCalledTimes(
        achievements.length
      );
      expect(service["awardAchievement"]).toHaveBeenCalledTimes(
        achievements.length
      );
    });

    it("should not award already achieved achievements", async () => {
      const userId = "user1";
      const gamification: Gamification = {
        // Added type annotation
        userId,
        achievements: [
          {
            id: "ach1",
            name: "Level 1",
            description: "Test Description", // Added description
            criteria: AchievementType.LEVEL_REACHED,
            requirement: 1,
            bonusPoints: 10,
            badge: null,
            userAchievements: [],
            iconUrl: "",
          },
        ], // Added type and other entity properties, removed criteria
        badges: [],
        points: 0,
        experience: 0,
        level: 0,
        nextLevelExperience: 200, // Added missing property
        stats: {
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
          learningStreak: 0,
          culturalContributions: 0,
        },
        recentActivities: [],
        activeMissions: [], // Added missing property
        culturalAchievements: [], // Added missing property
        createdAt: new Date(), // Added missing property
        updatedAt: new Date(), // Added missing property
        user: null, // Added missing property
        id: "gamification1", // Added missing property
      };
      const achievements: Achievement[] = [
        // Added type annotation
        {
        id: "ach1",
        name: "Level 1",
        description: "Test Description", // Added description
        criteria: AchievementType.LEVEL_REACHED, // Changed type to criteria
        requirement: 1,
        bonusPoints: 10,
        badge: null,
        userAchievements: [],
        iconUrl: "",
      },
      {
        id: "ach2",
        name: "Complete 1 Lesson",
        description: "Test Description", // Added description
        criteria: AchievementType.LESSONS_COMPLETED, // Changed type to criteria
        requirement: 1,
        bonusPoints: 10,
        badge: null,
        userAchievements: [],
        iconUrl: "",
      },
      ];

      jest
        .spyOn(gamificationRepository, "findOne")
        .mockResolvedValue(gamification as Gamification);
      jest
        .spyOn(achievementRepository, "find")
        .mockResolvedValue(achievements as Achievement[]);
      jest
        .spyOn(service as any, "checkAchievementCompletion")
        .mockResolvedValue(true);
      jest
        .spyOn(service as any, "awardAchievement")
        .mockResolvedValue(undefined);

      await service.checkAndAwardAchievements(userId);

      expect(service["checkAchievementCompletion"]).toHaveBeenCalledTimes(
        achievements.length - 1
      ); // ach1 is skipped
      expect(service["awardAchievement"]).toHaveBeenCalledTimes(
        achievements.length - 1
      ); // ach1 is skipped
    });

    it("should return if gamification entry not found", async () => {
      const userId = "user1";

      jest
        .spyOn(gamificationRepository, "findOne")
        .mockResolvedValue(undefined);
      jest.spyOn(achievementRepository, "find").mockResolvedValue([]);
      jest
        .spyOn(service as any, "checkAchievementCompletion")
        .mockResolvedValue(true);
      jest
        .spyOn(service as any, "awardAchievement")
        .mockResolvedValue(undefined);

      await service.checkAndAwardAchievements(userId);

      expect(gamificationRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
        relations: ["achievements", "badges"],
      });
      expect(achievementRepository.find).not.toHaveBeenCalled();
      expect(service["checkAchievementCompletion"]).not.toHaveBeenCalled();
      expect(service["awardAchievement"]).not.toHaveBeenCalled();
    });
  });

  describe("checkAchievementCompletion", () => {
    let gamification: Gamification;

    beforeEach(() => {
      gamification = {
        userId: "user1",
        achievements: [],
        badges: [],
        points: 100,
        experience: 100,
        level: 5,
        nextLevelExperience: 200, // Added missing property
        stats: {
          lessonsCompleted: 10,
          exercisesCompleted: 5,
          perfectScores: 3,
          learningStreak: 7,
          culturalContributions: 2,
        }, // Added exercisesCompleted
        recentActivities: [],
        activeMissions: [], // Added missing property
        culturalAchievements: [], // Added missing property
        createdAt: new Date(), // Added missing property
        updatedAt: new Date(), // Added missing property
        user: null, // Added missing property
        id: "gamification1", // Added missing property
      };
    });

    it("should return true for LEVEL_REACHED if requirement met", async () => {
      const achievement = {
        id: "ach1",
        name: "Level 5",
        description: "Test Description", // Added description
        criteria: AchievementType.LEVEL_REACHED, // Changed type to criteria
        requirement: 5,
        bonusPoints: 10,
        badge: null,
        userAchievements: [],
        iconUrl: "",
      } as Achievement;
      const result = await service["checkAchievementCompletion"](
        achievement,
        gamification
      );
      expect(result).toBe(true);
    });

    it("should return false for LEVEL_REACHED if requirement not met", async () => {
      const achievement = {
        id: "ach1",
        name: "Level 6",
        description: "Test Description", // Added description
        criteria: AchievementType.LEVEL_REACHED, // Changed type to criteria
        requirement: 6,
        bonusPoints: 10,
        badge: null,
        userAchievements: [],
        iconUrl: "",
      } as Achievement;
      const result = await service["checkAchievementCompletion"](
        achievement,
        gamification
      );
      expect(result).toBe(false);
    });

    it("should return true for LESSONS_COMPLETED if requirement met", async () => {
      const achievement = {
        id: "ach2",
        name: "Complete 10 Lessons",
        description: "Test Description", // Added description
        criteria: AchievementType.LESSONS_COMPLETED, // Changed type to criteria
        requirement: 10,
        bonusPoints: 10,
        badge: null,
        userAchievements: [],
        iconUrl: "",
      } as Achievement;
      const result = await service["checkAchievementCompletion"](
        achievement,
        gamification
      );
      expect(result).toBe(true);
    });

    it("should return false for LESSONS_COMPLETED if requirement not met", async () => {
      const achievement = {
        id: "ach2",
        name: "Complete 11 Lessons",
        description: "Test Description", // Added description
        criteria: AchievementType.LESSONS_COMPLETED, // Changed type to criteria
        requirement: 11,
        bonusPoints: 10,
        badge: null,
        userAchievements: [],
        iconUrl: "",
      } as Achievement;
      const result = await service["checkAchievementCompletion"](
        achievement,
        gamification
      );
      expect(result).toBe(false);
    });

    it("should return true for EXERCISES_COMPLETED if requirement met", async () => {
      // Added test for EXERCISES_COMPLETED
      const achievement = {
        id: "ach3",
        name: "Complete 5 Exercises",
        description: "Test Description", // Added description
        criteria: AchievementType.EXERCISES_COMPLETED, // Changed type to criteria
        requirement: 5,
        bonusPoints: 10,
        badge: null,
        userAchievements: [],
        iconUrl: "",
      } as Achievement;
      const result = await service["checkAchievementCompletion"](
        achievement,
        gamification
      );
      expect(result).toBe(true);
    });

    it("should return false for EXERCISES_COMPLETED if requirement not met", async () => {
      // Added test for EXERCISES_COMPLETED
      const achievement = {
        id: "ach3",
        name: "Complete 6 Exercises",
        description: "Test Description", // Added description
        criteria: AchievementType.EXERCISES_COMPLETED, // Changed type to criteria
        requirement: 6,
        bonusPoints: 10,
        badge: null,
        userAchievements: [],
        iconUrl: "",
      } as Achievement;
      const result = await service["checkAchievementCompletion"](
        achievement,
        gamification
      );
      expect(result).toBe(false);
    });

    it("should return true for PERFECT_SCORES if requirement met", async () => {
      const achievement = {
        id: "ach4",
        name: "3 Perfect Scores",
        description: "Test Description", // Added description
        criteria: AchievementType.PERFECT_SCORES, // Changed type to criteria
        requirement: 3,
        bonusPoints: 10,
        badge: null,
        userAchievements: [],
        iconUrl: "",
      } as Achievement;
      const result = await service["checkAchievementCompletion"](
        achievement,
        gamification
      );
      expect(result).toBe(true);
    });

    it("should return false for PERFECT_SCORES if requirement not met", async () => {
      const achievement = {
        id: "ach4",
        name: "4 Perfect Scores",
        description: "Test Description", // Added description
        criteria: AchievementType.PERFECT_SCORES, // Changed type to criteria
        requirement: 4,
        bonusPoints: 10,
        badge: null,
        userAchievements: [],
        iconUrl: "",
      } as Achievement;
      const result = await service["checkAchievementCompletion"](
        achievement,
        gamification
      );
      expect(result).toBe(false);
    });

    it("should return true for STREAK_MAINTAINED if requirement met", async () => {
      const achievement = {
        id: "ach5",
        name: "7 Day Streak",
        description: "Test Description", // Added description
        criteria: AchievementType.STREAK_MAINTAINED, // Changed type to criteria
        requirement: 7,
        bonusPoints: 10,
        badge: null,
        userAchievements: [],
        iconUrl: "",
      } as Achievement;
      const result = await service["checkAchievementCompletion"](
        achievement,
        gamification
      );
      expect(result).toBe(true);
    });

    it("should return false for STREAK_MAINTAINED if requirement not met", async () => {
      const achievement = {
        id: "ach5",
        name: "8 Day Streak",
        description: "Test Description", // Added description
        criteria: AchievementType.STREAK_MAINTAINED, // Changed type to criteria
        requirement: 8,
        bonusPoints: 10,
        badge: null,
        userAchievements: [],
        iconUrl: "",
      } as Achievement;
      const result = await service["checkAchievementCompletion"](
        achievement,
        gamification
      );
      expect(result).toBe(false);
    });

    it("should return true for CULTURAL_CONTRIBUTIONS if requirement met", async () => {
      const achievement = {
        id: "ach6",
        name: "2 Contributions",
        description: "Test Description", // Added description
        criteria: AchievementType.CULTURAL_CONTRIBUTIONS, // Changed type to criteria
        requirement: 2,
        bonusPoints: 10,
        badge: null,
        userAchievements: [],
        iconUrl: "",
      } as Achievement;
      const result = await service["checkAchievementCompletion"](
        achievement,
        gamification
      );
      expect(result).toBe(true);
    });

    it("should return false for CULTURAL_CONTRIBUTIONS if requirement not met", async () => {
      const achievement = {
        id: "ach6",
        name: "3 Contributions",
        description: "Test Description", // Added description
        criteria: AchievementType.CULTURAL_CONTRIBUTIONS, // Changed type to criteria
        requirement: 3,
        bonusPoints: 10,
        badge: null,
        userAchievements: [],
        iconUrl: "",
      } as Achievement;
      const result = await service["checkAchievementCompletion"](
        achievement,
        gamification
      );
      expect(result).toBe(false);
    });

    it("should return true for POINTS_EARNED if requirement met", async () => {
      const achievement = {
        id: "ach7",
        name: "100 Points",
        description: "Test Description", // Added description
        criteria: AchievementType.POINTS_EARNED, // Changed type to criteria
        requirement: 100,
        bonusPoints: 10,
        badge: null,
        userAchievements: [],
        iconUrl: "",
      } as Achievement;
      const result = await service["checkAchievementCompletion"](
        achievement,
        gamification
      );
      expect(result).toBe(true);
    });

    it("should return false for POINTS_EARNED if requirement not met", async () => {
      const achievement = {
        id: "ach7",
        name: "101 Points",
        description: "Test Description", // Added description
        criteria: AchievementType.POINTS_EARNED, // Changed type to criteria
        requirement: 101,
        bonusPoints: 10,
        badge: null,
        userAchievements: [],
        iconUrl: "",
      } as Achievement;
      const result = await service["checkAchievementCompletion"](
        achievement,
        gamification
      );
      expect(result).toBe(false);
    });

    it("should return true for FIRST_DAILY_LOGIN if requirement met", async () => {
      const achievement = {
        id: "ach8",
        name: "First Login",
        description: "Test Description", // Added description
        criteria: AchievementType.FIRST_DAILY_LOGIN, // Changed type to criteria
        requirement: 1,
        bonusPoints: 10,
        badge: null,
        userAchievements: [],
        iconUrl: "",
      } as Achievement;
      gamification.recentActivities.push({
        type: "login",
        description: "Login",
        pointsEarned: 0,
        timestamp: new Date(),
      });
      const result = await service["checkAchievementCompletion"](
        achievement,
        gamification
      );
      expect(result).toBe(true);
    });

    it("should return false for FIRST_DAILY_LOGIN if requirement not met", async () => {
      const achievement = {
        id: "ach8",
        name: "First Login",
        description: "Test Description", // Added description
        criteria: AchievementType.FIRST_DAILY_LOGIN, // Changed type to criteria
        requirement: 1,
        bonusPoints: 10,
        badge: null,
        userAchievements: [],
        iconUrl: "",
      } as Achievement;
      gamification.recentActivities.push({
        type: "other_activity",
        description: "Other",
        pointsEarned: 0,
        timestamp: new Date(),
      });
      const result = await service["checkAchievementCompletion"](
        achievement,
        gamification
      );
      expect(result).toBe(false);
    });

    it("should return false for unknown criteria", async () => {
      // Assuming UNKNOWN_CRITERIA is not a valid AchievementType
      const achievement = {
        id: "ach9",
        name: "Unknown",
        description: "Test Description", // Added description
        criteria: "UNKNOWN_CRITERIA" as any, // Changed type to criteria
        requirement: 1,
        bonusPoints: 10,
        badge: null,
        userAchievements: [],
        iconUrl: "",
      } as Achievement;
      const result = await service["checkAchievementCompletion"](
        achievement,
        gamification
      );
      expect(result).toBe(false);
    });
  });

  describe("awardAchievement", () => {
    it("should award an achievement to a user", async () => {
      // Updated achievement mock to use 'type' and include entity properties
      const achievement: Achievement = {
        id: "ach1",
        name: "Test Achievement",
        description: "Test Description", // Added description
        criteria: AchievementType.POINTS_EARNED, // Changed type to criteria
        bonusPoints: 50,
        badge: { id: "badge1", name: "Test Badge", icon: "" },
        requirement: 1,
        userAchievements: [],
        iconUrl: "",
      };
      // Updated gamification mock to include nextLevelExperience
      const gamification: Gamification = {
        userId: "user1",
        achievements: [],
        badges: [],
        points: 100,
        experience: 100,
        level: 5,
        nextLevelExperience: 200, // Added missing property
        stats: {
          lessonsCompleted: 10,
          exercisesCompleted: 5,
          perfectScores: 3,
          learningStreak: 7,
          culturalContributions: 2,
        }, // Added exercisesCompleted
        recentActivities: [],
        activeMissions: [], // Added missing property
        culturalAchievements: [], // Added missing property
        createdAt: new Date(), // Added missing property
        updatedAt: new Date(), // Added missing property
        user: null, // Added missing property
        id: "gamification1", // Added missing property
      };
      // Updated badge mock with required properties from Badge entity
      const badge: Badge = {
        id: "badge1",
        name: "Test Badge",
        description: "A test badge", // Added missing property
        category: "Test", // Added missing property
        tier: "bronze", // Added missing property
        requiredPoints: 0, // Added missing property
        iconUrl: "",
        requirements: {}, // Added missing property
        isSpecial: false, // Added missing property
        expirationDate: null, // Added missing property
        timesAwarded: 0, // Added missing property
        benefits: [], // Added missing property
        createdAt: new Date(), // Added missing property
        updatedAt: new Date(), // Added missing property
      };

      jest.spyOn(badgeRepository, "findOne").mockResolvedValue(badge);
      jest.spyOn(gamificationRepository, "save").mockResolvedValue(undefined);

      await service["awardAchievement"](
        achievement,
        gamification as Gamification
      );

      expect(gamification.achievements).toContain(achievement);
      expect(gamification.points).toBe(100 + achievement.bonusPoints);
      expect(gamification.experience).toBe(100 + achievement.bonusPoints);
      expect(gamification.badges).toContain(badge);
      expect(gamification.recentActivities.length).toBe(1);
      expect(gamification.recentActivities[0].type).toBe(
        "achievement_unlocked"
      );
      expect(gamificationRepository.save).toHaveBeenCalledWith(gamification);
    });

    it("should award an achievement without a badge", async () => {
      // Updated achievement mock to use 'type' and include entity properties
      const achievement: Achievement = {
        id: "ach1",
        name: "Test Achievement",
        description: "Test Description", // Added description
        criteria: AchievementType.POINTS_EARNED, // Changed type to criteria
        bonusPoints: 50,
        badge: null,
        requirement: 1,
        userAchievements: [],
        iconUrl: "",
      };
      // Updated gamification mock to include nextLevelExperience
      const gamification: Gamification = {
        userId: "user1",
        achievements: [],
        badges: [],
        points: 100,
        experience: 100,
        level: 5,
        nextLevelExperience: 200, // Added missing property
        stats: {
          lessonsCompleted: 10,
          exercisesCompleted: 5,
          perfectScores: 3,
          learningStreak: 7,
          culturalContributions: 2,
        }, // Added exercisesCompleted
        recentActivities: [],
        activeMissions: [], // Added missing property
        culturalAchievements: [], // Added missing property
        createdAt: new Date(), // Added missing property
        updatedAt: new Date(), // Added missing property
        user: null, // Added missing property
        id: "gamification1", // Added missing property
      };

      jest.spyOn(badgeRepository, "findOne").mockResolvedValue(undefined); // No badge found
      jest.spyOn(gamificationRepository, "save").mockResolvedValue(undefined);

      await service["awardAchievement"](
        achievement,
        gamification as Gamification
      );

      expect(gamification.achievements).toContain(achievement);
      expect(gamification.points).toBe(100 + achievement.bonusPoints);
      expect(gamification.experience).toBe(100 + achievement.bonusPoints);
      expect(gamification.badges).toEqual([]); // No badge added
      expect(gamification.recentActivities.length).toBe(1);
      expect(gamification.recentActivities[0].type).toBe(
        "achievement_unlocked"
      );
      expect(gamificationRepository.save).toHaveBeenCalledWith(gamification);
    });
  });

  describe("getAvailableAchievements", () => {
    it("should return achievements not yet unlocked by the user", async () => {
      const userId = "user1";
      const gamification: Gamification = {
        // Added type annotation
        userId,
        // Add missing properties for Achievement entity mock in achievements array
        achievements: [
          {
            id: "ach1",
            name: "Level 1",
            description: "Test Description", // Added description
            criteria: AchievementType.LEVEL_REACHED, // Changed type to criteria
            requirement: 1,
            bonusPoints: 10,
            badge: null,
            userAchievements: [],
            iconUrl: "",
          },
        ],
        badges: [], // Added missing property
        points: 0, // Added missing property
        experience: 0, // Added missing property
        level: 0, // Added missing property
        nextLevelExperience: 200, // Added missing property
        stats: {
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
          learningStreak: 0,
          culturalContributions: 0,
        }, // Added missing property
        recentActivities: [], // Added missing property
        activeMissions: [], // Added missing property
        culturalAchievements: [], // Added missing property
        createdAt: new Date(), // Added missing property
        updatedAt: new Date(), // Added missing property
        user: null, // Added missing property
        id: "gamification1", // Added missing property
      };
      const allAchievements: Achievement[] = [
        // Added type annotation
        {
          id: "ach1",
          name: "Level 1",
          description: "Test Description", // Added description
          criteria: AchievementType.LEVEL_REACHED, // Changed type to criteria
          requirement: 1,
          bonusPoints: 10,
          badge: null,
          userAchievements: [],
          iconUrl: "",
        },
        {
          id: "ach2",
          name: "Complete 1 Lesson",
          description: "Test Description", // Added description
          criteria: AchievementType.LESSONS_COMPLETED, // Changed type to criteria
          requirement: 1,
          bonusPoints: 10,
          badge: null,
          userAchievements: [],
          iconUrl: "",
        },
      ];

      jest
        .spyOn(gamificationRepository, "findOne")
        .mockResolvedValue(gamification as Gamification);
      jest
        .spyOn(achievementRepository, "find")
        .mockResolvedValue(allAchievements as Achievement[]);

      const result = await service.getAvailableAchievements(userId);
      expect(result).toEqual([
        {
          id: "ach2",
          name: "Complete 1 Lesson",
          description: "Test Description", // Added missing property
          criteria: "LESSONS_COMPLETED",
          requirement: 1,
          bonusPoints: 10,
          badge: null,
          userAchievements: [],
          iconUrl: "",
        },
      ]);
      expect(gamificationRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
        relations: ["achievements"],
      });
      expect(achievementRepository.find).toHaveBeenCalled();
    });

    it("should return all achievements if user has none unlocked", async () => {
      const userId = "user1";
      const gamification: Gamification = {
        // Added type annotation
        userId,
        achievements: [],
        badges: [], // Added missing property
        points: 0, // Added missing property
        experience: 0, // Added missing property
        level: 0, // Added missing property
        nextLevelExperience: 200, // Added missing property
        stats: {
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
          learningStreak: 0,
          culturalContributions: 0,
        }, // Added missing property
        recentActivities: [], // Added missing property
        activeMissions: [], // Added missing property
        culturalAchievements: [], // Added missing property
        createdAt: new Date(), // Added missing property
        updatedAt: new Date(), // Added missing property
        user: null, // Added missing property
        id: "gamification1", // Added missing property
      };
      const allAchievements: Achievement[] = [
        // Added type annotation
        {
          id: "ach1",
          name: "Level 1",
          description: "Test Description", // Added description
          criteria: AchievementType.LEVEL_REACHED, // Changed type to criteria
          requirement: 1,
          bonusPoints: 10,
          badge: null,
          userAchievements: [],
          iconUrl: "",
        },
        {
          id: "ach2",
          name: "Complete 1 Lesson",
          description: "Test Description", // Added description
          criteria: AchievementType.LESSONS_COMPLETED, // Changed type to criteria
          requirement: 1,
          bonusPoints: 10,
          badge: null,
          userAchievements: [],
          iconUrl: "",
        },
      ];

      jest
        .spyOn(gamificationRepository, "findOne")
        .mockResolvedValue(gamification as Gamification);
      jest
        .spyOn(achievementRepository, "find")
        .mockResolvedValue(allAchievements as Achievement[]);

      const result = await service.getAvailableAchievements(userId);
      expect(result).toEqual(allAchievements);
      expect(gamificationRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
        relations: ["achievements"],
      });
      expect(achievementRepository.find).toHaveBeenCalled();
    });

    it("should return empty array if gamification entry not found", async () => {
      const userId = "user1";

      jest
        .spyOn(gamificationRepository, "findOne")
        .mockResolvedValue(undefined);
      jest.spyOn(achievementRepository, "find").mockResolvedValue([]);

      const result = await service.getAvailableAchievements(userId);
      expect(result).toEqual([]);
      expect(gamificationRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
        relations: ["achievements"],
      });
      expect(achievementRepository.find).not.toHaveBeenCalled();
    });
  });

  describe("getUserAchievements", () => {
    it("should return achievements unlocked by the user", async () => {
      const userId = "user1";
      const gamification: Gamification = {
        // Added type annotation
        userId,
        // Add missing properties for Achievement entity mock in achievements array
        achievements: [
          {
            id: "ach1",
            name: "Level 1",
            description: "Test Description", // Added description
            criteria: AchievementType.LEVEL_REACHED, // Changed type to criteria
            requirement: 1,
            bonusPoints: 10,
            badge: null,
            userAchievements: [],
            iconUrl: "",
          },
        ],
        badges: [], // Added missing property
        points: 0, // Added missing property
        experience: 0, // Added missing property
        level: 0, // Added missing property
        nextLevelExperience: 200, // Added missing property
        stats: {
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
          learningStreak: 0,
          culturalContributions: 0,
        }, // Added missing property
        recentActivities: [], // Added missing property
        activeMissions: [], // Added missing property
        culturalAchievements: [], // Added missing property
        createdAt: new Date(), // Added missing property
        updatedAt: new Date(), // Added missing property
        user: null, // Added missing property
        id: "gamification1", // Added missing property
      };

      jest
        .spyOn(gamificationRepository, "findOne")
        .mockResolvedValue(gamification as Gamification);

      const result = await service.getUserAchievements(userId);
      expect(result).toEqual(gamification.achievements);
      expect(gamificationRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
        relations: ["achievements"],
      });
    });

    it("should return empty array if user has no achievements", async () => {
      const userId = "user1";
      const gamification: Gamification = {
        // Added type annotation
        userId,
        achievements: [],
        badges: [], // Added missing property
        points: 0, // Added missing property
        experience: 0, // Added missing property
        level: 0, // Added missing property
        nextLevelExperience: 200, // Added missing property
        stats: {
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
          learningStreak: 0,
          culturalContributions: 0,
        }, // Added missing property
        recentActivities: [], // Added missing property
        activeMissions: [], // Added missing property
        culturalAchievements: [], // Added missing property
        createdAt: new Date(), // Added missing property
        updatedAt: new Date(), // Added missing property
        user: null, // Added missing property
        id: "gamification1", // Added missing property
      };

      jest
        .spyOn(gamificationRepository, "findOne")
        .mockResolvedValue(gamification as Gamification);

      const result = await service.getUserAchievements(userId);
      expect(result).toEqual([]);
      expect(gamificationRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
        relations: ["achievements"],
      });
    });

    it("should return empty array if gamification entry not found", async () => {
      const userId = "user1";

      jest
        .spyOn(gamificationRepository, "findOne")
        .mockResolvedValue(undefined);

      const result = await service.getUserAchievements(userId);
      expect(result).toEqual([]);
      expect(gamificationRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
        relations: ["achievements"],
      });
    });
  });
});
