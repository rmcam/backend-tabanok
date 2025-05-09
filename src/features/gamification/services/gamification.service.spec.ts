import { User } from "@/auth/entities/user.entity";
import { UserRole, UserStatus } from "@/auth/enums/auth.enum";
import { UserActivity } from "@/features/activity/entities/user-activity.entity";
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { Achievement } from "../entities/achievement.entity";
import { Leaderboard } from "../entities/leaderboard.entity";
import { Mission } from "../entities/mission.entity";
import { Reward } from "../entities/reward.entity";
import { UserAchievement } from "../entities/user-achievement.entity";
import { UserLevel } from "../entities/user-level.entity";
import { UserMission } from "../entities/user-mission.entity";
import { UserReward } from "../entities/user-reward.entity";
import { GamificationService } from "./gamification.service";
import { NotFoundException } from "@nestjs/common";


// Mock de los repositorios y servicios
// Definir MockType fuera de la descripción del describe
type MockType<T> = {
  [P in keyof T]?: jest.Mock<any, any>;
};

// Mock de los repositorios
const mockRewardRepository: MockType<Repository<Reward>> = {
  find: jest.fn(),
  findOne: jest.fn(),
};

const mockUserLevelRepository: MockType<Repository<UserLevel>> = {
  create: jest.fn().mockImplementation((data) => data), // Mock create to return data
  save: jest.fn().mockImplementation((data) => data), // Mock save to return data
  findOne: jest.fn(),
};

const mockUserRepository: MockType<Repository<User>> = {
  findOne: jest.fn().mockImplementation((query) => {
    // Asegurarse de que query.where.id sea manejado correctamente, ya sea string o number
    const userId =
      typeof query.where.id === "number"
        ? query.where.id
        : parseInt(query.where.id);
    if (!isNaN(userId) && userId >= 0 && userId < 100) {
      return {
        id: userId.toString(),
        username: `testuser${userId}`,
        email: `test${userId}@example.com`,
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: 0,
          level: 1,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
    }
    return undefined;
  }),
  save: jest.fn().mockImplementation((userToSave) => userToSave), // Mock save to return the user object
};

const mockUserRewardRepository: MockType<Repository<UserReward>> = {
  save: jest.fn().mockImplementation((data) => data), // Mock save to return data
  create: jest.fn().mockImplementation((data) => data), // Mock create to return data
  findOne: jest.fn(), // Añadir findOne ya que se usa en grantBadge
};

const mockActivityRepository: MockType<Repository<UserActivity>> = {
  // Mock para ActivityRepository
  create: jest.fn().mockImplementation((data) => data), // Mock create to return data
  save: jest.fn().mockImplementation((data) => data), // Mock save to return data
};

const mockAchievementRepository: MockType<Repository<Achievement>> = {
  // Mock para AchievementRepository
  findOne: jest.fn(),
};

const mockMissionRepository: MockType<Repository<Mission>> = {
  // Mock para MissionRepository
  findOne: jest.fn(),
};

const mockUserMissionRepository: MockType<Repository<UserMission>> = {
  // Mock para UserMissionRepository
  create: jest.fn().mockImplementation((data) => data), // Mock create to return data
  save: jest.fn().mockImplementation((data) => data), // Mock save to return data
};

const mockUserAchievementRepository: MockType<Repository<UserAchievement>> = {
  // Mock para UserAchievementRepository
  save: jest.fn().mockImplementation((data) => data), // Mock save to return data
  findOne: jest.fn(),
  create: jest.fn().mockImplementation((data) => data), // Añadir create ya que se usa en grantAchievement
};

const mockLeaderboardRepository: MockType<Repository<Leaderboard>> = {
  // Mock para LeaderboardRepository
  find: jest.fn(),
  findOne: jest.fn(),
  // Añadir otros métodos si se usan en el servicio
};

// Mock para DataSource
const mockDataSource = {
  manager: {
    transaction: jest.fn(async (callback) => {
      // Mock transactionalEntityManager
      const transactionalEntityManager = {
        findOne: jest.fn(),
        update: jest.fn(),
        // Add other methods if used within the transaction callback
      };
      // Execute the callback with the mock transactionalEntityManager
      await callback(transactionalEntityManager);
    }),
  },
  // Add other DataSource properties/methods if needed elsewhere
};

describe("GamificationService", () => {
  let service: GamificationService;
  let rewardRepository: MockType<Repository<Reward>>;
  let userRepository: MockType<Repository<User>>;
  let userAchievementRepository: MockType<Repository<UserAchievement>>;
  let userRewardRepository: MockType<Repository<UserReward>>;
  let activityRepository: MockType<Repository<UserActivity>>; // Declarar activityRepository
  let achievementRepository: MockType<Repository<Achievement>>; // Declarar achievementRepository
  let missionRepository: MockType<Repository<Mission>>; // Declarar missionRepository
  let userMissionRepository: MockType<Repository<UserMission>>; // Declarar userMissionRepository
  let leaderboardRepository: MockType<Repository<Leaderboard>>; // Declarar leaderboardRepository
  let userLevelRepository: MockType<Repository<UserLevel>>; // Declarar userLevelRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationService,
        {
          provide: getRepositoryToken(Reward), // Añadir RewardRepository
          useValue: mockRewardRepository, // Usar useValue
        },
        {
          provide: getRepositoryToken(UserAchievement),
          useValue: mockUserAchievementRepository, // Usar useValue
        },
        { provide: getRepositoryToken(User), useValue: mockUserRepository }, // Usar useValue
        {
          provide: getRepositoryToken(UserReward),
          useValue: mockUserRewardRepository, // Usar useValue
        },
        {
          provide: getRepositoryToken(UserActivity),
          useValue: mockActivityRepository, // Usar useValue
        }, // Añadir ActivityRepository
        {
          provide: getRepositoryToken(Achievement),
          useValue: mockAchievementRepository, // Usar useValue
        }, // Añadir AchievementRepository
        {
          provide: getRepositoryToken(Mission),
          useValue: mockMissionRepository, // Usar useValue
        }, // Añadir MissionRepository
        {
          provide: getRepositoryToken(UserMission),
          useValue: mockUserMissionRepository, // Usar useValue
        }, // Añadir UserMissionRepository
        {
          provide: getRepositoryToken(Leaderboard), // Usar la entidad Leaderboard
          useValue: mockLeaderboardRepository, // Usar useValue
        }, // Añadir mock para LeaderboardRepository
        {
          provide: getRepositoryToken(UserLevel), // Añadir UserLevelRepository
          useValue: mockUserLevelRepository, // Usar useValue
        },
        { provide: DataSource, useValue: mockDataSource }, // Añadir mock para DataSource
      ],
    }).compile();

    service = module.get<GamificationService>(GamificationService);
    // Asignar directamente los mocks creados fuera del beforeEach
    rewardRepository = mockRewardRepository;
    userRepository = mockUserRepository;
    userAchievementRepository = mockUserAchievementRepository;
    userRewardRepository = mockUserRewardRepository;
    activityRepository = mockActivityRepository; // Inicializar activityRepository
    achievementRepository = mockAchievementRepository; // Inicializar achievementRepository
    missionRepository = mockMissionRepository; // Inicializar missionRepository
    userMissionRepository = mockUserMissionRepository; // Inicializar userMissionRepository
    leaderboardRepository = mockLeaderboardRepository; // Inicializar leaderboardRepository
    userLevelRepository = mockUserLevelRepository; // Inicializar userLevelRepository
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("addPoints", () => {
    it("should add points to a user and update their level", async () => {
      // Arrange
      const userId = 1;
      const points = 100;
      const initialPoints = 0;
      const user = {
        id: userId.toString(), // Usar toString() para que coincida con el mock de findOne
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: initialPoints,
          level: 1,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockReturnValue(user);
      (userRepository.save as jest.Mock).mockImplementation(
        (userToSave) => userToSave
      ); // Return the user object after saving

      // Mock calculateLevel function
      const calculateLevelSpy = jest.spyOn(
        require("@/lib/gamification"),
        "calculateLevel"
      );
      calculateLevelSpy.mockReturnValue(2); // Mock the calculated level

      // Act
      const result = await service.addPoints(userId, points);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(user.gameStats.totalPoints).toEqual(initialPoints + points); // Check if points were added to the user object
      expect(calculateLevelSpy).toHaveBeenCalledWith(
        user.gameStats.totalPoints
      ); // Check if calculateLevel was called with correct points
      expect(user.gameStats.level).toEqual(2); // Check if user level was updated based on mocked calculateLevel
      expect(userRepository.save).toHaveBeenCalledWith(user); // Check if the user object with updated points and level was saved
      expect(result.gameStats.totalPoints).toEqual(initialPoints + points);
      expect(result.gameStats.level).toEqual(2);

      calculateLevelSpy.mockRestore(); // Restore the mocked function
    });

    it("should add 0 points without changing total points or level", async () => {
      // Arrange
      const userId = 1;
      const points = 0;
      const initialPoints = 100;
      const initialLevel = 2;
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: initialPoints,
          level: initialLevel,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockReturnValue(user);
      (userRepository.save as jest.Mock).mockImplementation(
        (userToSave) => userToSave
      );

      const calculateLevelSpy = jest.spyOn(
        require("../../../lib/gamification"),
        "calculateLevel"
      );
      calculateLevelSpy.mockReturnValue(initialLevel); // Level should not change

      // Act
      const result = await service.addPoints(userId, points);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(user.gameStats.totalPoints).toEqual(initialPoints); // Points should not change
      expect(calculateLevelSpy).toHaveBeenCalledWith(
        user.gameStats.totalPoints
      );
      expect(user.gameStats.level).toEqual(initialLevel); // Level should not change
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(result.gameStats.totalPoints).toEqual(initialPoints);
      expect(result.gameStats.level).toEqual(initialLevel);

      calculateLevelSpy.mockRestore();
    });

    it("should add points without causing a level up", async () => {
      // Arrange
      const userId = 1;
      const points = 50;
      const initialPoints = 100;
      const initialLevel = 2;
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: initialPoints,
          level: initialLevel,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockReturnValue(user);
      (userRepository.save as jest.Mock).mockImplementation(
        (userToSave) => userToSave
      );

      const calculateLevelSpy = jest.spyOn(
        require("../../../lib/gamification"),
        "calculateLevel"
      );
      calculateLevelSpy.mockReturnValue(initialLevel); // Level should not change

      // Act
      const result = await service.addPoints(userId, points);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(user.gameStats.totalPoints).toEqual(initialPoints + points); // Points should be added
      expect(calculateLevelSpy).toHaveBeenCalledWith(
        user.gameStats.totalPoints
      );
      expect(user.gameStats.level).toEqual(initialLevel); // Level should not change
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(result.gameStats.totalPoints).toEqual(initialPoints + points);
      expect(result.gameStats.level).toEqual(initialLevel);

      calculateLevelSpy.mockRestore();
    });
  });

  describe("addPoints", () => {
    it("should add points to a user", async () => {
      // Arrange
      const userId = 1;
      const pointsToAdd = 50;
      const initialPoints = 100;
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: initialPoints,
          level: 2,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockReturnValue(user);
      (userRepository.save as jest.Mock).mockImplementation(
        (userToSave) => userToSave
      ); // Return the user object after saving

      // Act
      const result = await service.addPoints(userId, pointsToAdd);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(user.gameStats.totalPoints).toEqual(initialPoints + pointsToAdd); // Check if points were added to the user object
      expect(userRepository.save).toHaveBeenCalledWith(user); // Check if the user object with updated points was saved
      expect(result.gameStats.totalPoints).toEqual(initialPoints + pointsToAdd); // Check the returned user object
    });

    it("should throw an error if user is not found", async () => {
      // Arrange
      const userId = 999;
      const pointsToAdd = 50;

      (userRepository.findOne as jest.Mock).mockReturnValue(undefined); // User not found

      // Act & Assert
      await expect(service.addPoints(userId, pointsToAdd)).rejects.toThrowError(
        `User with ID ${userId} not found`
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(userRepository.save).not.toHaveBeenCalled(); // Save should not be called if user is not found
    });
  });

  describe("updateStats", () => {
    it("should update user game stats", async () => {
      // Arrange
      const userId = 1;
      const initialStats = {
        totalPoints: 100,
        level: 2,
        lessonsCompleted: 5,
        exercisesCompleted: 10,
        perfectScores: 2,
      };
      const statsToUpdate = { lessonsCompleted: 6, perfectScores: 3 };
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: initialStats,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockReturnValue(user);
      (userRepository.save as jest.Mock).mockImplementation(
        (userToSave) => userToSave
      ); // Return the user object after saving

      // Act
      const result = await service.updateStats(userId, statsToUpdate);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(user.gameStats).toEqual({ ...initialStats, ...statsToUpdate }); // Check if gameStats were updated
      expect(userRepository.save).toHaveBeenCalledWith(user); // Check if the user object with updated stats was saved
      expect(result.gameStats).toEqual({ ...initialStats, ...statsToUpdate }); // Check the returned user object
    });

    it("should throw an error if user is not found", async () => {
      // Arrange
      const userId = 999;
      const statsToUpdate = { lessonsCompleted: 1 };

      (userRepository.findOne as jest.Mock).mockReturnValue(undefined); // User not found

      // Act & Assert
      await expect(
        service.updateStats(userId, statsToUpdate)
      ).rejects.toThrowError(`User with ID ${userId} not found`);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(userRepository.save).not.toHaveBeenCalled(); // Save should not be called if user is not found
    });
  });

  describe("getUserStats", () => {
    it("should return user game stats including calculated level", async () => {
      // Arrange
      const userId = 1;
      const userPoints = 250;
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: userPoints,
          level: 3,
          lessonsCompleted: 10,
          exercisesCompleted: 20,
          perfectScores: 5,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user); // Corregido: usar mockResolvedValue

      // Mock calculateLevel function
      const calculateLevelSpy = jest.spyOn(
        require("../../../lib/gamification"),
        "calculateLevel"
      );
      calculateLevelSpy.mockReturnValue(4); // Mock the calculated level

      // Act
      const result = await service.getUserStats(userId);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(calculateLevelSpy).toHaveBeenCalledWith(
        user.gameStats.totalPoints
      ); // Check if calculateLevel was called with correct points
      expect(result.gameStats.level).toEqual(4); // Corregido: esperar solo la propiedad level dentro de gameStats

      calculateLevelSpy.mockRestore(); // Restore the mocked function
    });

    it("should throw an error if user is not found", async () => {
      // Arrange
      const userId = 999;

      (userRepository.findOne as jest.Mock).mockReturnValue(undefined); // User not found

      // Act & Assert
      await expect(service.getUserStats(userId)).rejects.toThrowError(
        `User with ID ${userId} not found`
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
    });
  });

  describe("grantAchievement", () => {
    it("should grant an achievement to a user", async () => {
      // Arrange
      const userId = 1;
      const achievementId = 10;
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: 100,
          level: 2,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
      const achievement = {
        id: achievementId.toString(),
        name: "Test Achievement",
      };

      (userRepository.findOne as jest.Mock).mockReturnValue(user);
      (achievementRepository.findOne as jest.Mock).mockReturnValue(achievement); // Usar achievementRepository inyectado
      (userAchievementRepository.save as jest.Mock).mockImplementation(
        (userAchievementToSave) => userAchievementToSave
      ); // Return the user achievement object after saving
      (userRepository.save as jest.Mock).mockImplementation(
        (userToSave) => userToSave
      ); // Return the user object after saving

      // Act
      const result = await service.grantAchievement(userId, achievementId);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(achievementRepository.findOne).toHaveBeenCalledWith({
        where: { id: achievementId.toString() },
      }); // Usar achievementRepository inyectado
      (userAchievementRepository.findOne as jest.Mock).mockResolvedValue({
        userId: user.id,
        achievementId: achievement.id,
        dateAwarded: expect.any(Date),
      });
      expect(userAchievementRepository.save).toHaveBeenCalledWith(
        expect.any(Object)
      );
      expect(userRepository.save).toHaveBeenCalledWith(user); // Check if the user object was saved
      expect(result).toEqual(user); // Check the returned user object
    });

    it("should throw an error if user is not found", async () => {
      // Arrange
      const userId = 999;
      const achievementId = 10;

      (userRepository.findOne as jest.Mock).mockReturnValue(undefined); // User not found

      // Act & Assert
      await expect(
        service.grantAchievement(userId, achievementId)
      ).rejects.toThrowError(`User with ID ${userId} not found`);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(achievementRepository.findOne).not.toHaveBeenCalled(); // Usar achievementRepository inyectado
      expect(userAchievementRepository.save).not.toHaveBeenCalled(); // User achievement save should not be called
      expect(userRepository.save).not.toHaveBeenCalled(); // User save should not be called
    });

    it("should throw an error if achievement is not found", async () => {
      // Arrange
      const userId = 1;
      const achievementId = 99;
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: 100,
          level: 2,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockReturnValue(user);
      (achievementRepository.findOne as jest.Mock).mockReturnValue(undefined); // Usar achievementRepository inyectado

      // Act & Assert
      await expect(
        service.grantAchievement(userId, achievementId)
      ).rejects.toThrowError(`Achievement with ID ${achievementId} not found`);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(achievementRepository.findOne).toHaveBeenCalledWith({
        where: { id: achievementId.toString() },
      }); // Usar achievementRepository inyectado
      expect(userAchievementRepository.save).not.toHaveBeenCalled(); // User achievement save should not be called
      expect(userRepository.save).not.toHaveBeenCalled(); // User save should not be called
    });

    it("should grant an achievement to a user even if they already have it", async () => {
      // Arrange
      const userId = 1;
      const achievementId = 10;
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: 100,
          level: 2,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
      const achievement = {
        id: achievementId.toString(),
        name: "Test Achievement",
      };
      // Simulate existing achievement by mocking findOne on userAchievementRepository
      (userAchievementRepository.findOne as jest.Mock).mockResolvedValue({
        userId: user.id,
        achievementId: achievement.id,
        dateAwarded: expect.any(Date),
      });
      (userRepository.findOne as jest.Mock).mockReturnValue(user);
      (achievementRepository.findOne as jest.Mock).mockReturnValue(achievement);
      (userAchievementRepository.save as jest.Mock).mockImplementation(
        (userAchievementToSave) => userAchievementToSave
      );
      (userRepository.save as jest.Mock).mockImplementation(
        (userToSave) => userToSave
      );

      // Act
      const result = await service.grantAchievement(userId, achievementId);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(achievementRepository.findOne).toHaveBeenCalledWith({
        where: { id: achievementId.toString() },
      });
      // Expect save to be called even if findOne returned an existing achievement
      expect(userAchievementRepository.save).toHaveBeenCalledWith(
        expect.any(Object)
      );
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });
  });

  describe("grantBadge", () => {
    it("should grant a badge to a user", async () => {
      // Arrange
      const userId = 1;
      const badgeId = 40;
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: 100,
          level: 2,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
      const badge = { id: badgeId.toString(), name: "Test Badge" };

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (rewardRepository.findOne as jest.Mock).mockResolvedValue(badge);
      (userRewardRepository.save as jest.Mock).mockImplementation(
        (userRewardToSave) => userRewardToSave
      );
      (userRepository.save as jest.Mock).mockResolvedValue(user);

      // Act
      const result = await service.grantBadge(userId, badgeId);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(rewardRepository.findOne).toHaveBeenCalledWith({
        where: { id: badgeId.toString() },
      });
      expect(userRewardRepository.save).toHaveBeenCalledWith(
        expect.any(Object)
      );
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });

    it("should throw an error if user is not found", async () => {
      // Arrange
      const userId = 999;
      const badgeId = 40;

      (userRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      // Act & Assert
      await expect(service.grantBadge(userId, badgeId)).rejects.toThrowError(
        `User with ID ${userId} not found`
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(rewardRepository.findOne).not.toHaveBeenCalled();
      expect(userRewardRepository.save).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it("should throw an error if badge is not found", async () => {
      // Arrange
      const userId = 1;
      const badgeId = 99;
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: 100,
          level: 2,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (rewardRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      // Act & Assert
      await expect(service.grantBadge(userId, badgeId)).rejects.toThrowError(
        `Reward with ID ${badgeId} not found`
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(rewardRepository.findOne).toHaveBeenCalledWith({
        where: { id: badgeId.toString() },
      });
      expect(userRewardRepository.save).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("assignMission", () => {
    it("should assign a mission to a user", async () => {
      // Arrange
      const userId = 1;
      const missionId = 30;
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: 100,
          level: 2,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
      const mission = { id: missionId.toString(), name: "Test Mission" };

      (userRepository.findOne as jest.Mock).mockReturnValue(user);
      (missionRepository.findOne as jest.Mock).mockReturnValue(mission); // Usar missionRepository inyectado
      (userMissionRepository.create as jest.Mock).mockImplementation(
        (userMissionData) => userMissionData
      ); // Usar userMissionRepository inyectado
      (userMissionRepository.save as jest.Mock).mockImplementation(
        (userMissionToSave) => userMissionToSave
      ); // Usar userMissionRepository inyectado
      (userRepository.save as jest.Mock).mockImplementation(
        (userToSave) => userToSave
      ); // Return the user object after saving

      // Act
      const result = await service.assignMission(userId, missionId);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(missionRepository.findOne).toHaveBeenCalledWith({
        where: { id: missionId.toString() },
      }); // Usar missionRepository inyectado
      expect(userMissionRepository.create).toHaveBeenCalledWith({
        // Usar userMissionRepository inyectado
        userId: user.id,
        missionId: mission.id,
      });
      expect(userMissionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          // Usar userMissionRepository inyectado
          user: user,
          mission: mission,
        })
      );
      expect(userRepository.save).toHaveBeenCalledWith(user); // Check if the user object was saved
      expect(result).toEqual(user); // Check the returned user object
    });

    it("should throw an error if user is not found", async () => {
      // Arrange
      const userId = 999;
      const missionId = 30;

      (userRepository.findOne as jest.Mock).mockReturnValue(undefined); // User not found

      // Act & Assert
      await expect(
        service.assignMission(userId, missionId)
      ).rejects.toThrowError(`User with ID ${userId} not found`);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(missionRepository.findOne).not.toHaveBeenCalled(); // Usar missionRepository inyectado
      expect(userMissionRepository.create).not.toHaveBeenCalled(); // Usar userMissionRepository inyectado
      expect(userMissionRepository.save).not.toHaveBeenCalled(); // Usar userMissionRepository inyectado
      expect(userRepository.save).not.toHaveBeenCalled(); // User save should not be called
    });

    it("should throw an error if mission is not found", async () => {
      // Arrange
      const userId = 1;
      const missionId = 99;
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: 100,
          level: 2,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockReturnValue(user);
      (missionRepository.findOne as jest.Mock).mockReturnValue(undefined); // Usar missionRepository inyectado

      // Act & Assert
      await expect(
        service.assignMission(userId, missionId)
      ).rejects.toThrowError(`Mission with ID ${missionId} not found`);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(missionRepository.findOne).toHaveBeenCalledWith({
        where: { id: missionId.toString() },
      }); // Usar missionRepository inyectado
      expect(userMissionRepository.create).not.toHaveBeenCalled(); // Usar userMissionRepository inyectado
      expect(userMissionRepository.save).not.toHaveBeenCalled(); // Usar userMissionRepository inyectado
      expect(userRepository.save).not.toHaveBeenCalled(); // User save should not be called
    });
  });

  describe("awardPoints", () => {
    it("should award points and create an activity for a user", async () => {
      // Arrange
      const userId = 1;
      const pointsToAward = 75;
      const activityType = "exercise";
      const description = "Completed exercise 1";
      const initialPoints = 100;
      const initialLessonsCompleted = 5;
      const initialExercisesCompleted = 10;
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: initialPoints,
          level: 2,
          lessonsCompleted: initialLessonsCompleted,
          exercisesCompleted: initialExercisesCompleted,
          perfectScores: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockReturnValue(user);
      (activityRepository.create as jest.Mock).mockImplementation(
        (activityData) => activityData
      ); // Usar activityRepository inyectado
      (activityRepository.save as jest.Mock).mockImplementation(
        (activityToSave) => activityToSave
      ); // Usar activityRepository inyectado
      (userRepository.save as jest.Mock).mockImplementation(
        (userToSave) => userToSave
      ); // Return the user object after saving

      // Act
      const result = await service.awardPoints(
        userId,
        pointsToAward,
        activityType,
        description
      );

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(user.gameStats.totalPoints).toEqual(initialPoints + pointsToAward); // Check if points were added to user.gameStats.totalPoints
      expect(activityRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: activityType,
          description: description,
          user: user,
        })
      );
      expect(activityRepository.save).toHaveBeenCalled();
      expect(user.gameStats.exercisesCompleted).toEqual(
        initialExercisesCompleted + 1
      ); // Check if exercise stat was updated
      expect(user.gameStats.lessonsCompleted).toEqual(initialLessonsCompleted); // Check if lesson stat was not updated
      expect(userRepository.save).toHaveBeenCalledWith(user); // Check if the user object with updated points and stats was saved
      expect(result.gameStats.totalPoints).toEqual(
        initialPoints + pointsToAward
      ); // Check the returned user object points
      expect(result.gameStats.exercisesCompleted).toEqual(
        initialExercisesCompleted + 1
      ); // Check the returned user object stats
    });

    it("should update lesson completed stat for lesson activity type", async () => {
      // Arrange
      const userId = 1;
      const pointsToAward = 50;
      const activityType = "lesson";
      const description = "Completed lesson 1";
      const initialLessonsCompleted = 5;
      const initialExercisesCompleted = 10;
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: 100,
          level: 2,
          lessonsCompleted: initialLessonsCompleted,
          exercisesCompleted: initialExercisesCompleted,
          perfectScores: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockReturnValue(user);
      (activityRepository.create as jest.Mock).mockImplementation(
        (activityData) => activityData
      ); // Usar activityRepository inyectado
      (activityRepository.save as jest.Mock).mockImplementation(
        (activityToSave) => activityToSave
      ); // Usar activityRepository inyectado
      (userRepository.save as jest.Mock).mockImplementation(
        (userToSave) => userToSave
      ); // Return the user object after saving

      // Act
      const result = await service.awardPoints(
        userId,
        pointsToAward,
        activityType,
        description
      );

      // Assert
      expect(user.gameStats.lessonsCompleted).toEqual(
        initialLessonsCompleted + 1
      ); // Check if lesson stat was updated
      expect(user.gameStats.exercisesCompleted).toEqual(
        initialExercisesCompleted
      ); // Check if exercise stat was not updated
      expect(result.gameStats.lessonsCompleted).toEqual(
        initialLessonsCompleted + 1
      ); // Check the returned user object stats
    });

    it("should not update any stats for unknown activity type", async () => {
      // Arrange
      const userId = 1;
      const pointsToAward = 25;
      const activityType = "unknown"; // Unknown activity type
      const description = "Completed something unknown";
      const initialLessonsCompleted = 5;
      const initialExercisesCompleted = 10;
      const initialPerfectScores = 0;
      const initialPoints = 100; // Declarar e inicializar initialPoints
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: initialPoints,
          level: 2,
          lessonsCompleted: initialLessonsCompleted,
          exercisesCompleted: initialExercisesCompleted,
          perfectScores: initialPerfectScores,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockReturnValue(user);
      (activityRepository.create as jest.Mock).mockImplementation(
        (activityData) => activityData
      );
      (activityRepository.save as jest.Mock).mockImplementation(
        (activityToSave) => activityToSave
      );
      (userRepository.save as jest.Mock).mockImplementation(
        (userToSave) => userToSave
      );

      // Act
      const result = await service.awardPoints(
        userId,
        pointsToAward,
        activityType,
        description
      );

      // Assert
      expect(user.gameStats.lessonsCompleted).toEqual(initialLessonsCompleted); // Check if lesson stat was not updated
      expect(user.gameStats.exercisesCompleted).toEqual(
        initialExercisesCompleted
      ); // Check if exercise stat was not updated
      expect(user.gameStats.perfectScores).toEqual(initialPerfectScores); // Check if perfectScores stat was not updated
      expect(result.gameStats.lessonsCompleted).toEqual(
        initialLessonsCompleted
      ); // Check the returned user object stats
      expect(result.gameStats.exercisesCompleted).toEqual(
        initialExercisesCompleted
      ); // Check the returned user object stats
      expect(result.gameStats.perfectScores).toEqual(initialPerfectScores); // Check the returned user object stats
    });

    it("should update perfect scores stat for perfect-score activity type", async () => {
      // Arrange
      const userId = 1;
      const pointsToAward = 100;
      const activityType = "perfect-score"; // Perfect score activity type
      const description = "Achieved perfect score on exercise 5";
      const initialLessonsCompleted = 5;
      const initialExercisesCompleted = 10;
      const initialPerfectScores = 3;
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: 100,
          level: 2,
          lessonsCompleted: initialLessonsCompleted,
          exercisesCompleted: initialExercisesCompleted,
          perfectScores: initialPerfectScores,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockReturnValue(user);
      (activityRepository.create as jest.Mock).mockImplementation(
        (activityData) => activityData
      );
      (activityRepository.save as jest.Mock).mockImplementation(
        (activityToSave) => activityToSave
      );
      (userRepository.save as jest.Mock).mockImplementation(
        (userToSave) => userToSave
      );

      // Act
      const result = await service.awardPoints(
        userId,
        pointsToAward,
        activityType,
        description
      );

      // Assert
      expect(user.gameStats.lessonsCompleted).toEqual(initialLessonsCompleted); // Check if lesson stat was not updated
      expect(user.gameStats.exercisesCompleted).toEqual(
        initialExercisesCompleted
      ); // Check if exercise stat was not updated
      expect(user.gameStats.perfectScores).toEqual(initialPerfectScores + 1); // Check if perfectScores stat was updated
      expect(result.gameStats.lessonsCompleted).toEqual(
        initialLessonsCompleted
      ); // Check the returned user object stats
      expect(result.gameStats.exercisesCompleted).toEqual(
        initialExercisesCompleted
      ); // Check the returned user object stats
      expect(result.gameStats.perfectScores).toEqual(initialPerfectScores + 1); // Check the returned user object stats
    });

    it("should throw an error if user is not found", async () => {
      // Arrange
      const userId = 999;
      const pointsToAward = 50;
      const activityType = "exercise";
      const description = "Completed exercise 1";

      (userRepository.findOne as jest.Mock).mockReturnValue(undefined); // User not found

      // Act & Assert
      await expect(
        service.awardPoints(userId, pointsToAward, activityType, description)
      ).rejects.toThrowError(`User with ID ${userId} not found`);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(activityRepository.create).not.toHaveBeenCalled(); // Usar activityRepository inyectado
      expect(activityRepository.save).not.toHaveBeenCalled(); // Usar activityRepository inyectado
      expect(userRepository.save).not.toHaveBeenCalled(); // User save should not be called
    });

    it("should throw an error if activityRepository.save fails", async () => {
      // Arrange
      const userId = 1;
      const pointsToAward = 75;
      const activityType = "exercise";
      const description = "Completed exercise 1";
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: 100,
          level: 2,
          lessonsCompleted: 5,
          exercisesCompleted: 10,
          perfectScores: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockReturnValue(user);
      (activityRepository.create as jest.Mock).mockImplementation(
        (activityData) => activityData
      );
      (activityRepository.save as jest.Mock).mockRejectedValue(
        new Error("Failed to save activity")
      ); // Simulate save failure
      (userRepository.save as jest.Mock).mockImplementation(
        (userToSave) => userToSave
      );

      // Act & Assert
      await expect(
        service.awardPoints(userId, pointsToAward, activityType, description)
      ).rejects.toThrowError("Failed to save activity");
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(activityRepository.create).toHaveBeenCalledWith({
        type: activityType,
        description: description,
        user: user,
      });
      expect(activityRepository.save).toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled(); // User save should not be called if activity save fails
    });

    it("should throw an error if userRepository.save fails after updating stats", async () => {
      // Arrange
      const userId = 1;
      const pointsToAward = 75;
      const activityType = "exercise";
      const description = "Completed exercise 1";
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: 100,
          level: 2,
          lessonsCompleted: 5,
          exercisesCompleted: 10,
          perfectScores: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockReturnValue(user);
      (activityRepository.create as jest.Mock).mockImplementation(
        (activityData) => activityData
      );
      (activityRepository.save as jest.Mock).mockImplementation(
        (activityToSave) => activityToSave
      );
      (userRepository.save as jest.Mock).mockRejectedValue(
        new Error("Failed to save user")
      ); // Simulate user save failure

      // Act & Assert
      await expect(
        service.awardPoints(userId, pointsToAward, activityType, description)
      ).rejects.toThrowError("Failed to save user");
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(activityRepository.create).toHaveBeenCalledWith({
        type: activityType,
        description: description,
        user: user,
      });
      expect(activityRepository.save).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalledWith(user);
    });
  });

  describe("createUserLevel", () => {
    it("should create a new user level entry", async () => {
      // Arrange
      const user = {
        id: "uuid",
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: 0,
          level: 1,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const newUserLevel = { user, userId: user.id };
      (userLevelRepository.create as jest.Mock).mockReturnValue(
        // Corregido: usar userLevelRepository
        newUserLevel
      );
      (userLevelRepository.save as jest.Mock).mockResolvedValue(
        // Corregido: usar userLevelRepository
        newUserLevel
      );

      // Act
      const result = await service.createUserLevel(user);

      // Assert
      expect(userLevelRepository.create).toHaveBeenCalledWith({
        // Corregido: usar userLevelRepository
        user,
        userId: user.id,
      });
      expect(userLevelRepository.save).toHaveBeenCalledWith(
        // Corregido: usar userLevelRepository
        newUserLevel
      );
      expect(result).toEqual(newUserLevel);
    });
  });

  describe("getRewards", () => {
    it("should return a list of all rewards", async () => {
      // Arrange
      const rewards = [
        { id: "1", name: "Badge 1" },
        { id: "2", name: "Badge 2" },
      ];
      (rewardRepository.find as jest.Mock).mockResolvedValue(rewards);

      // Act
      const result = await service.getRewards();

      // Assert
      expect(rewardRepository.find).toHaveBeenCalled();
      expect(result).toEqual(rewards);
    });
  });

  describe("findByUserId", () => {
    it("should return a user if found", async () => {
      // Arrange
      const userId = 1;
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: 0,
          level: 1,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
      (userRepository.findOne as jest.Mock).mockResolvedValue(user);

      // Act
      const result = await service.findByUserId(userId);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(result).toEqual(user);
    });

    it("should return undefined if user is not found", async () => {
      // Arrange
      const userId = 999;
      (userRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await service.findByUserId(userId);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(result).toBeUndefined();
    });
  });

  describe("Performance Testing", () => {
    it("should handle a large number of requests without performance degradation", async () => {
      // Arrange
      const numberOfUsers = 100;
      const pointsPerUser = 50;

      // Act
      const start = performance.now();
      for (let i = 0; i < numberOfUsers; i++) {
        await service.addPoints(i, pointsPerUser);
      }
      const end = performance.now();

      const duration = end - start;
      const averageTime = duration / numberOfUsers;

      // Assert
      console.log(
        `Processed ${numberOfUsers} users in ${duration}ms (average ${averageTime}ms per user)`
      );
      expect(averageTime).toBeLessThan(10); // Adjust the threshold as needed
    });
  });

  describe("User Flow Integration Tests", () => {
    it("should correctly update user stats and level after completing a lesson", async () => {
      // Arrange
      const userId = 1;
      const initialPoints = 50;
      const initialLevel = 1;
      const initialLessonsCompleted = 0;
      const pointsForLesson = 20;
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: initialPoints,
          level: initialLevel,
          lessonsCompleted: initialLessonsCompleted,
          exercisesCompleted: 0,
          perfectScores: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (activityRepository.create as jest.Mock).mockImplementation(
        (activityData) => activityData
      );
      (activityRepository.save as jest.Mock).mockResolvedValue({}); // Mock save to resolve
      (userRepository.save as jest.Mock).mockImplementation(
        (userToSave) => userToSave
      ); // Return the user object after saving

      // Mock calculateLevel function
      const calculateLevelSpy = jest.spyOn(
        require("../../../lib/gamification"),
        "calculateLevel"
      );
      calculateLevelSpy.mockReturnValue(initialLevel); // Assume no level up initially

      // Act: Simulate completing a lesson
      const updatedUser = await service.awardPoints(
        userId,
        pointsForLesson,
        "lesson",
        "Completed Lesson 1"
      );

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(activityRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "lesson",
          description: "Completed Lesson 1",
          user: user,
        })
      );
      expect(activityRepository.save).toHaveBeenCalled();
      expect(updatedUser.gameStats.totalPoints).toEqual(
        initialPoints + pointsForLesson
      );
      expect(updatedUser.gameStats.lessonsCompleted).toEqual(
        initialLessonsCompleted + 1
      );
      expect(updatedUser.gameStats.level).toEqual(initialLevel); // Verify level based on mock
      expect(calculateLevelSpy).toHaveBeenCalledWith(
        initialPoints + pointsForLesson
      );
      expect(userRepository.save).toHaveBeenCalledWith(user);

      calculateLevelSpy.mockRestore();
    });

    it("should correctly update user stats and level after completing an exercise with perfect score", async () => {
      // Arrange
      const userId = 1;
      const initialPoints = 150;
      const initialLevel = 2;
      const initialExercisesCompleted = 5;
      const initialPerfectScores = 1;
      const pointsForExercise = 30;
      const pointsForPerfectScore = 50; // Additional points for perfect score
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: initialPoints,
          level: initialLevel,
          lessonsCompleted: 0,
          exercisesCompleted: initialExercisesCompleted,
          perfectScores: initialPerfectScores,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (activityRepository.create as jest.Mock).mockImplementation(
        (activityData) => activityData
      );
      (activityRepository.save as jest.Mock).mockResolvedValue({}); // Mock save to resolve
      (userRepository.save as jest.Mock).mockImplementation(
        (userToSave) => userToSave
      ); // Return the user object after saving

      // Mock calculateLevel function
      const calculateLevelSpy = jest.spyOn(
        require("../../../lib/gamification"),
        "calculateLevel"
      );
      calculateLevelSpy.mockReturnValue(initialLevel); // Assume no level up initially

      // Act: Simulate completing an exercise with perfect score
      // This might involve two calls to awardPoints in a real scenario,
      // one for exercise completion and one for perfect score.
      // For this test, we'll simulate the combined effect or a single call if the service handles it.
      // Based on the service code, awardPoints handles different activity types.
      // Let's simulate the perfect-score activity type which also implies exercise completion.
      const updatedUser = await service.awardPoints(
        userId,
        pointsForExercise + pointsForPerfectScore, // Total points awarded
        "perfect-score",
        "Completed Exercise 5 with Perfect Score"
      );

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(activityRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "perfect-score",
          description: "Completed Exercise 5 with Perfect Score",
          user: user,
        })
      );
      expect(activityRepository.save).toHaveBeenCalled();
      expect(updatedUser.gameStats.totalPoints).toEqual(
        initialPoints + pointsForExercise + pointsForPerfectScore
      );
      expect(updatedUser.gameStats.exercisesCompleted).toEqual(
        initialExercisesCompleted + 1
      );
      expect(updatedUser.gameStats.perfectScores).toEqual(
        initialPerfectScores + 1
      );
      expect(updatedUser.gameStats.level).toEqual(initialLevel); // Verify level based on mock
      expect(calculateLevelSpy).toHaveBeenCalledWith(
        initialPoints + pointsForExercise + pointsForPerfectScore
      );
      expect(userRepository.save).toHaveBeenCalledWith(user);

      calculateLevelSpy.mockRestore();
    });

    it("should correctly update user stats and level after completing a lesson that triggers a level up", async () => {
      // Arrange
      const userId = 1;
      const initialPoints = 80; // Points close to level up
      const initialLevel = 1;
      const initialLessonsCompleted = 0;
      const pointsForLesson = 30; // Points that will cause a level up
      const user = {
        id: userId.toString(), // Usar toString()
        username: "testuser",
        email: "test@example.example.com",
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        gameStats: {
          totalPoints: initialPoints,
          level: initialLevel,
          lessonsCompleted: initialLessonsCompleted,
          exercisesCompleted: 0,
          perfectScores: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (activityRepository.create as jest.Mock).mockImplementation(
        (activityData) => activityData
      );
      (activityRepository.save as jest.Mock).mockResolvedValue({});
      (userRepository.save as jest.Mock).mockImplementation(
        (userToSave) => userToSave
      );

      // Mock calculateLevel function to return a new level
      const calculateLevelSpy = jest.spyOn(
        require("../../../lib/gamification"),
        "calculateLevel"
      );
      calculateLevelSpy.mockReturnValue(initialLevel + 1); // Simulate level up

      // Act: Simulate completing a lesson
      const updatedUser = await service.awardPoints(
        userId,
        pointsForLesson,
        "lesson",
        "Completed Lesson 2"
      );

      // Assert
      expect(updatedUser.gameStats.totalPoints).toEqual(
        initialPoints + pointsForLesson
      );
      expect(updatedUser.gameStats.lessonsCompleted).toEqual(
        initialLessonsCompleted + 1
      );
      expect(updatedUser.gameStats.level).toEqual(initialLevel + 1); // Verify level up
      expect(calculateLevelSpy).toHaveBeenCalledWith(
        initialPoints + pointsForLesson
      );
      expect(userRepository.save).toHaveBeenCalledWith(user);

      calculateLevelSpy.mockRestore();
    });

    // TODO: Add tests for other user flows:
    // - Completing an activity that grants a badge (similar to achievement)
    // - Completing a mission (requires tracking mission progress and marking as complete)
  });

  it("should correctly grant a badge after completing an activity that meets the criteria", async () => {
    // Arrange
    const userId = 1;
    const initialPoints = 100;
    const initialLevel = 2;
    const initialExercisesCompleted = 9; // Close to achievement requirement
    const pointsForExercise = 20;
    const rewardId = "collab-badge"; // Assume this achievement requires 10 exercises
    const user = {
      id: userId.toString(), // Usar toString()
      username: "testuser",
      email: "test@example.com",
      password: "password",
      firstName: "Test",
      lastName: "User",
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      languages: [],
      preferences: { notifications: false, language: "es", theme: "light" },
      culturalPoints: 0,
      gameStats: {
        totalPoints: initialPoints,
        level: initialLevel,
        lessonsCompleted: 0,
        exercisesCompleted: initialExercisesCompleted,
        perfectScores: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
    const reward = {
      id: rewardId,
      name: "Collab Badge",
      description: "Contributed to a collaborative project",
    };

    (userRepository.findOne as jest.Mock).mockResolvedValue(user);
    (activityRepository.create as jest.Mock).mockImplementation(
      (activityData) => activityData
    );
    (activityRepository.save as jest.Mock).mockResolvedValue({});
    (userRepository.save as jest.Mock).mockImplementation(
      (userToSave) => userToSave
    );
    (rewardRepository.findOne as jest.Mock).mockResolvedValue(reward); // Mock finding the achievement
    (userRewardRepository.findOne as jest.Mock).mockResolvedValue(null); // User does not have the achievement yet
    (userRewardRepository.save as jest.Mock).mockResolvedValue({}); // Mock saving the user achievement

    // Mock calculateLevel function
    const calculateLevelSpy = jest.spyOn(
      require("../../../lib/gamification"),
      "calculateLevel"
    );
    calculateLevelSpy.mockReturnValue(initialLevel);

    // Act: Simulate completing an exercise (the 10th one)
    const updatedUser = await service.awardPoints(
      userId,
      pointsForExercise,
      "collab",
      "Contributed to a collaborative project"
    );

    // Assert
    expect(rewardRepository.findOne).toHaveBeenCalledWith({
      where: { id: "collab" },
    });
    expect(userRewardRepository.findOne).toHaveBeenCalledWith({
      where: { userId: user.id, rewardId: reward.id },
    });
    expect(userRewardRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: user.id,
        rewardId: reward.id,
      })
    );
    expect(userRepository.save).toHaveBeenCalledWith(user); // User saved after achievement grant

    calculateLevelSpy.mockRestore();
  });

  it("should handle a large number of requests without performance degradation", async () => {
    // Arrange
    const numberOfUsers = 100;
    const pointsPerUser = 50;

    // Act
    const start = performance.now();
    for (let i = 0; i < numberOfUsers; i++) {
      await service.addPoints(i, pointsPerUser);
    }
    const end = performance.now();

    const duration = end - start;
    const averageTime = duration / numberOfUsers;

    // Assert
    console.log(
      `Processed ${numberOfUsers} users in ${duration}ms (average ${averageTime}ms per user)`
    );
    expect(averageTime).toBeLessThan(10); // Adjust the threshold as needed
  });
});
