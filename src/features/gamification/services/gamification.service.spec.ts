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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User; // Eliminar gameStats de User mock
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
  create: jest.fn().mockImplementation((activityData) => activityData), // Mock create to return data
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
      const initialLevel = 1;
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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const initialUserLevel = {
        id: "user-level-id", // Add ID for UserLevel mock
        user: user,
        userId: user.id,
        level: initialLevel,
        experience: 0,
        points: initialPoints,
        experienceToNextLevel: 100,
        consistencyStreak: { current: 0, longest: 0, lastActivityDate: null },
        streakHistory: [],
        levelHistory: [],
        activityLog: [],
        bonuses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lessonsCompleted: 0, // Added missing property
        exercisesCompleted: 0, // Added missing property
        perfectScores: 0, // Added missing property
      } as UserLevel;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (userLevelRepository.findOne as jest.Mock).mockResolvedValue(
        initialUserLevel
      );
      (userLevelRepository.save as jest.Mock).mockImplementation(
        (userLevelToSave) => userLevelToSave
      );

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
      expect(userLevelRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId.toString() } },
      });
      expect(result.points).toEqual(initialPoints + points); // Check if points were added to UserLevel
      expect(result.experience).toEqual(initialUserLevel.experience + points); // Check if experience was added to UserLevel
      expect(calculateLevelSpy).toHaveBeenCalledWith(result.points); // Check if calculateLevel was called with correct points from UserLevel
      expect(result.level).toEqual(2); // Check if user level was updated based on mocked calculateLevel
      expect(userLevelRepository.save as jest.Mock).toHaveBeenCalledWith(result); // Check if the UserLevel object was saved
      expect(result).toBeInstanceOf(UserLevel); // Check the returned type
      expect(result.user).toEqual(user); // Check if the user relation is still there

      calculateLevelSpy.mockRestore(); // Restore the mocked function

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
      expect(rewardRepository.find as jest.Mock).toHaveBeenCalled();
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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
      (userRepository.findOne as jest.Mock).mockResolvedValue(user);

      // Act
      const result = await service.findByUserId(userId);

      // Assert
      expect(userRepository.findOne as jest.Mock).toHaveBeenCalledWith({
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
      expect(userRepository.findOne as jest.Mock).toHaveBeenCalledWith({
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

      // Mock User and UserLevel findOne and save for performance test
      const mockUser = (id: number) =>
        ({
          id: id.toString(),
          username: `testuser${id}`,
          email: `test${id}@example.com`,
          password: "password",
          firstName: "Test",
          lastName: "User",
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          languages: [],
          preferences: { notifications: false, language: "es", theme: "light" },
          culturalPoints: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }) as User;

      const mockUserLevel = (
        user: User,
        initialPoints: number,
        initialLevel: number
      ) =>
        ({
          id: `user-level-id-${user.id}`,
          user: user,
          userId: user.id,
          level: initialLevel,
          experience: initialPoints,
          points: initialPoints,
          experienceToNextLevel: 100,
          consistencyStreak: { current: 0, longest: 0, lastActivityDate: null },
          streakHistory: [],
          levelHistory: [],
          activityLog: [],
          bonuses: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
        }) as UserLevel;

      (userRepository.findOne as jest.Mock).mockImplementation(
        async ({ where: { id } }) => {
          const userId = parseInt(id);
          if (!isNaN(userId) && userId >= 0 && userId < numberOfUsers) {
            return mockUser(userId);
          }
          return undefined;
        }
      );

      (userLevelRepository.findOne as jest.Mock).mockImplementation(
        async ({
          where: {
            user: { id },
          },
        }) => {
          const userId = parseInt(id);
          if (!isNaN(userId) && userId >= 0 && userId < numberOfUsers) {
            const user = mockUser(userId);
            // Simulate finding an existing UserLevel
            return mockUserLevel(
              user,
              userId * 10,
              Math.floor(userId / 10) + 1
            ); // Example initial points and level
          }
          return undefined;
        }
      );

      (userLevelRepository.save as jest.Mock).mockImplementation(
        async (userLevelToSave) => userLevelToSave
      );

      // Mock calculateLevel function to return a fixed value for performance test
      const calculateLevelSpy = jest.spyOn(
        require("../../../lib/gamification"),
        "calculateLevel"
      );
      calculateLevelSpy.mockReturnValue(2); // Fixed level

      // Act
      const start = performance.now();
      const promises = [];
      for (let i = 0; i < numberOfUsers; i++) {
        promises.push(service.addPoints(i, pointsPerUser));
      }
      await Promise.all(promises);
      const end = performance.now();

      const duration = end - start;
      const averageTime = duration / numberOfUsers;

      // Assert
      
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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const initialUserLevel = {
        id: "user-level-id", // Add ID for UserLevel mock
        user: user,
        userId: user.id,
        level: initialLevel,
        experience: 500,
        points: initialPoints,
        experienceToNextLevel: 600,
        consistencyStreak: {
          current: 5,
          longest: 10,
          lastActivityDate: new Date(),
        },
        streakHistory: [],
        levelHistory: [],
        activityLog: [],
        bonuses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lessonsCompleted: 0, // Added missing property
        exercisesCompleted: 0, // Added missing property
        perfectScores: 0, // Added missing property
      } as UserLevel;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (userLevelRepository.findOne as jest.Mock).mockResolvedValue(
        initialUserLevel
      );
      (userLevelRepository.save as jest.Mock).mockImplementation(
        (userLevelToSave) => userLevelToSave
      );

      // Act
      const result = await service.addPoints(userId, points);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(userLevelRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId.toString() } },
      });
      expect(result.points).toEqual(initialPoints + points); // Check if points were added to UserLevel
      expect(result.experience).toEqual(
        initialUserLevel.experience + points
      ); // Check if experience was added to UserLevel
      expect(userLevelRepository.save as jest.Mock).toHaveBeenCalledWith(result); // Check if the UserLevel object was saved
      expect(result).toBeInstanceOf(UserLevel); // Check the returned type
    });

    it("should throw an error if user is not found", async () => {
      // Arrange
      const userId = 999;
      const pointsToAdd = 50;

      (userRepository.findOne as jest.Mock).mockResolvedValue(undefined); // User not found

      // Act & Assert
      await expect(service.addPoints(userId, pointsToAdd)).rejects.toThrowError(
        `User with ID ${userId} not found`
      );
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(userLevelRepository.findOne).not.toHaveBeenCalled(); // UserLevel should not be searched if user not found
      expect(userLevelRepository.save).not.toHaveBeenCalled(); // Save should not be called if user is not found
    });

    it("should create UserLevel if it does not exist", async () => {
      // Arrange
      const userId = 1;
      const pointsToAdd = 50;
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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const initialUserLevel = {
        id: "new-user-level-id",
        user: user,
        userId: user.id,
        level: 1,
        experience: 0,
        points: 0,
        experienceToNextLevel: 100,
        consistencyStreak: { current: 0, longest: 0, lastActivityDate: null },
        streakHistory: [],
        levelHistory: [],
        activityLog: [],
        bonuses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lessonsCompleted: 0, // Added missing property
        exercisesCompleted: 0, // Added missing property
        perfectScores: 0, // Added missing property
      } as UserLevel;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (userLevelRepository.findOne as jest.Mock).mockResolvedValue(undefined); // UserLevel does not exist
      (userLevelRepository.create as jest.Mock).mockImplementation(
        (data) => ({
          ...data,
          id: "new-user-level-id",
          level: 1,
          experience: 0,
          points: 0,
        }) // Mock created UserLevel with ID
      );
      (userLevelRepository.save as jest.Mock).mockImplementation(
        (userLevelToSave) => userLevelToSave
      );

      const calculateLevelSpy = jest.spyOn(
        require("../../../lib/gamification"),
        "calculateLevel"
      );
      calculateLevelSpy.mockReturnValue(1); // Assume level 1 initially

      // Act
      const result = await service.addPoints(userId, pointsToAdd);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(userLevelRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId.toString() } },
      });
      expect(userLevelRepository.create as jest.Mock).toHaveBeenCalledWith({ user: user }); // Check if UserLevel was created
      expect(result.points).toEqual(pointsToAdd); // Check if points were added to the new UserLevel
      expect(result.experience).toEqual(pointsToAdd); // Check if experience was added to the new UserLevel
      expect(calculateLevelSpy).toHaveBeenCalledWith(result.points);
      expect(result.level).toEqual(1); // Check initial level
      expect(userLevelRepository.save as jest.Mock).toHaveBeenCalledWith(result);
      expect(result).toBeInstanceOf(UserLevel);

      calculateLevelSpy.mockRestore();
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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const initialUserLevel = {
        id: "user-level-id",
        user: user,
        userId: user.id,
        level: initialStats.level,
        experience: 500, // Example initial experience
        points: initialStats.totalPoints,
        experienceToNextLevel: 600, // Example
        consistencyStreak: {
          current: 5,
          longest: 10,
          lastActivityDate: new Date(),
        }, // Example
        streakHistory: [], // Example
        levelHistory: [], // Example
        activityLog: [], // Example
        bonuses: [], // Example
        createdAt: new Date(),
        updatedAt: new Date(),
        lessonsCompleted: initialStats.lessonsCompleted, // Assuming these are moved to UserLevel
        exercisesCompleted: initialStats.exercisesCompleted, // Assuming these are moved to UserLevel
        perfectScores: initialStats.perfectScores, // Assuming these are moved to UserLevel
      } as UserLevel;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (userLevelRepository.findOne as jest.Mock).mockResolvedValue(
        initialUserLevel
      );
      (userLevelRepository.save as jest.Mock).mockImplementation(
        (userLevelToSave) => userLevelToSave
      );

      // Act
      const result = await service.updateStats(userId, statsToUpdate);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(userLevelRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId.toString() } },
      });
      // Check if UserLevel stats were updated
      expect(result.lessonsCompleted).toEqual(statsToUpdate.lessonsCompleted);
      expect(result.perfectScores).toEqual(statsToUpdate.perfectScores);
      // Check if other stats remain unchanged
      expect(result.points).toEqual(initialUserLevel.points);
      expect(result.level).toEqual(initialUserLevel.level);
      expect(result.exercisesCompleted).toEqual(
        initialUserLevel.exercisesCompleted
      );

      expect(userLevelRepository.save as jest.Mock).toHaveBeenCalledWith(result); // Check if the UserLevel object was saved
      expect(result).toBeInstanceOf(UserLevel); // Check the returned type
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
      expect(userLevelRepository.findOne).not.toHaveBeenCalled(); // UserLevel should not be searched if user not found
      expect(userLevelRepository.save).not.toHaveBeenCalled(); // Save should not be called if user is not found
    });

    it("should create UserLevel if it does not exist and update stats", async () => {
      // Arrange
      const userId = 1;
      const statsToUpdate = { lessonsCompleted: 1, perfectScores: 1 };
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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (userLevelRepository.findOne as jest.Mock).mockResolvedValue(undefined); // UserLevel does not exist
      (userLevelRepository.create as jest.Mock).mockImplementation(
        (data) => ({
          ...data,
          id: "new-user-level-id",
          level: 1,
          experience: 0,
          points: 0,
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
        }) // Mock created UserLevel with initial stats
      );
      (userLevelRepository.save as jest.Mock).mockImplementation(
        (userLevelToSave) => userLevelToSave
      );

      // Act
      const result = await service.updateStats(userId, statsToUpdate);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(userLevelRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId.toString() } },
      });
      expect(userLevelRepository.create as jest.Mock).toHaveBeenCalledWith({ user: user }); // Check if UserLevel was created
      // Check if stats were updated in the new UserLevel
      expect(result.lessonsCompleted).toEqual(statsToUpdate.lessonsCompleted);
      expect(result.perfectScores).toEqual(statsToUpdate.perfectScores);
      // Check initial values for other stats
      expect(result.points).toEqual(0);
      expect(result.level).toEqual(1);
      expect(result.exercisesCompleted).toEqual(0);

      expect(userLevelRepository.save as jest.Mock).toHaveBeenCalledWith(result);
      expect(result).toBeInstanceOf(UserLevel);
    });
  });

  describe("getUserStats", () => {
    it("should return user game stats including calculated level", async () => {
      // Arrange
      const userId = 1;
      const userPoints = 250;
      const initialLevel = 3; // Initial level in mock UserLevel
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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const userLevel = {
        id: "user-level-id",
        user: user,
        userId: user.id,
        level: initialLevel,
        experience: 500,
        points: userPoints,
        experienceToNextLevel: 600,
        consistencyStreak: {
          current: 5,
          longest: 10,
          lastActivityDate: new Date(),
        },
        streakHistory: [],
        levelHistory: [],
        activityLog: [],
        bonuses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lessonsCompleted: 10,
        exercisesCompleted: 20,
        perfectScores: 5,
      } as UserLevel;

      (userLevelRepository.findOne as jest.Mock).mockResolvedValue(userLevel); // Mock findOne on UserLevelRepository

      // Mock calculateLevel function
      const calculateLevelSpy = jest.spyOn(
        require("../../../lib/gamification"),
        "calculateLevel"
      );
      calculateLevelSpy.mockReturnValue(4); // Mock the calculated level

      // Act
      const result = await service.getUserStats(userId);

      // Assert
      expect(userLevelRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId.toString() } },
        relations: ["user"], // Ensure relations are loaded
      });
      expect(calculateLevelSpy).toHaveBeenCalledWith(
        result.points // Check if calculateLevel was called with points from UserLevel
      );
      expect(result.level).toEqual(4); // Check if user level was updated based on mocked calculateLevel
      expect(result).toBeInstanceOf(UserLevel); // Check the returned type
      expect(result.points).toEqual(userPoints); // Check if points are correct
      expect(result.lessonsCompleted).toEqual(10); // Check if other stats are included
    });

    it("should throw an error if UserLevel is not found", async () => {
      // Arrange
      const userId = 999;

      (userLevelRepository.findOne as jest.Mock).mockResolvedValue(undefined); // UserLevel not found

      // Act & Assert
      await expect(service.getUserStats(userId)).rejects.toThrowError(
        `UserLevel for user with ID ${userId} not found`
      );
      expect(userLevelRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId.toString() } },
        relations: ["user"],
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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
      const achievement = {
        id: achievementId.toString(),
        name: "Test Achievement",
      };

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (achievementRepository.findOne as jest.Mock).mockResolvedValue(
        achievement
      ); // Usar achievementRepository inyectado
      (userAchievementRepository.save as jest.Mock).mockImplementation(
        (userAchievementToSave) => userAchievementToSave
      ); // Return the user achievement object after saving
      (userRepository.save as jest.Mock).mockResolvedValue(user); // Return the user object after saving

      // Act
      const result = await service.grantAchievement(userId, achievementId);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(achievementRepository.findOne).toHaveBeenCalledWith({
        where: { id: achievementId.toString() },
      }); // Usar achievementRepository inyectado
      expect(userAchievementRepository.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: user.id,
          achievementId: achievement.id,
        })
      );
      expect(userAchievementRepository.save as jest.Mock).toHaveBeenCalledWith(
        expect.any(Object)
      );
      expect(userRepository.save as jest.Mock).toHaveBeenCalledWith(user); // Check if the user object was saved
      expect(result).toEqual(user); // Check the returned user object
    });

    it("should throw an error if user is not found", async () => {
      // Arrange
      const userId = 999;
      const achievementId = 10;

      (userRepository.findOne as jest.Mock).mockResolvedValue(undefined); // User not found

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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (achievementRepository.findOne as jest.Mock).mockResolvedValue(undefined); // Usar achievementRepository inyectado

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
      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (achievementRepository.findOne as jest.Mock).mockResolvedValue(
        achievement
      );
      (userAchievementRepository.save as jest.Mock).mockImplementation(
        (userAchievementToSave) => userAchievementToSave
      );
      (userRepository.save as jest.Mock).mockResolvedValue(user);

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
      expect(userAchievementRepository.save as jest.Mock).toHaveBeenCalledWith(
        expect.any(Object)
      );
      expect(userRepository.save as jest.Mock).toHaveBeenCalledWith(user);
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
      expect(userRewardRepository.save as jest.Mock).toHaveBeenCalledWith(
        expect.any(Object)
      );
      expect(userRepository.save as jest.Mock).toHaveBeenCalledWith(user);
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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
      const mission = { id: missionId.toString(), name: "Test Mission" };

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (missionRepository.findOne as jest.Mock).mockResolvedValue(mission); // Usar missionRepository inyectado
      (userMissionRepository.create as jest.Mock).mockImplementation(
        (userMissionData) => userMissionData
      ); // Usar userMissionRepository inyectado
      (userMissionRepository.save as jest.Mock).mockImplementation(
        (userMissionToSave) => userMissionToSave
      ); // Usar userMissionRepository inyectado
      (userRepository.save as jest.Mock).mockResolvedValue(user); // Return the user object after saving

      // Act
      const result = await service.assignMission(userId, missionId);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(missionRepository.findOne).toHaveBeenCalledWith({
        where: { id: missionId.toString() },
      }); // Usar missionRepository inyectado
      expect(userMissionRepository.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: user.id,
          missionId: mission.id,
        })
      );
      expect(userMissionRepository.save as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          // Usar userMissionRepository inyectado
          user: user,
          mission: mission,
        })
      );
      expect(userRepository.save as jest.Mock).toHaveBeenCalledWith(user); // Check if the user object was saved
      expect(result).toEqual(user); // Check the returned user object
    });

    it("should throw an error if user is not found", async () => {
      // Arrange
      const userId = 999;
      const missionId = 30;

      (userRepository.findOne as jest.Mock).mockResolvedValue(undefined); // User not found

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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (missionRepository.findOne as jest.Mock).mockResolvedValue(undefined); // Usar missionRepository inyectado

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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const initialUserLevel = {
        id: "user-level-id",
        user: user,
        userId: user.id,
        level: 2,
        experience: 500,
        points: initialPoints,
        experienceToNextLevel: 600,
        consistencyStreak: {
          current: 5,
          longest: 10,
          lastActivityDate: new Date(),
        },
        streakHistory: [],
        levelHistory: [],
        activityLog: [],
        bonuses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lessonsCompleted: initialLessonsCompleted,
        exercisesCompleted: initialExercisesCompleted,
        perfectScores: 0,
      } as UserLevel;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (userLevelRepository.findOne as jest.Mock).mockResolvedValue(
        initialUserLevel
      );
      (activityRepository.create as jest.Mock).mockImplementation(
        (activityData) => activityData
      ); // Usar activityRepository inyectado
      (activityRepository.save as jest.Mock).mockResolvedValue({}); // Usar activityRepository inyectado
      (userLevelRepository.save as jest.Mock).mockImplementation(
        (userLevelToSave) => userLevelToSave
      ); // Return the userLevel object after saving

      // Mock calculateLevel function
      const calculateLevelSpy = jest.spyOn(
        require("../../../lib/gamification"),
        "calculateLevel"
      );
      calculateLevelSpy.mockReturnValue(2); // Assume no level up initially

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
      expect(userLevelRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId.toString() } },
      });
      expect(activityRepository.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: activityType,
          description: description,
          user: user,
        })
      );
      expect(activityRepository.save as jest.Mock).toHaveBeenCalled();
      // Check if UserLevel stats were updated
      expect(result.points).toEqual(initialPoints + pointsToAward);
      expect(result.experience).toEqual(
        initialUserLevel.experience + pointsToAward
      );
      expect(result.exercisesCompleted).toEqual(initialExercisesCompleted + 1);
      expect(result.lessonsCompleted).toEqual(initialLessonsCompleted); // Should not change
      expect(result.perfectScores).toEqual(initialUserLevel.perfectScores); // Should not change

      expect(calculateLevelSpy).toHaveBeenCalledWith(result.points);
      expect(result.level).toEqual(initialUserLevel.level); // Verify level based on mock

      expect(userLevelRepository.save as jest.Mock).toHaveBeenCalledWith(result); // Check if the UserLevel object with updated stats was saved
      expect(result).toBeInstanceOf(UserLevel); // Check the returned type
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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const initialUserLevel = {
        id: "user-level-id",
        user: user,
        userId: user.id,
        level: 2,
        experience: 500,
        points: 100,
        experienceToNextLevel: 600,
        consistencyStreak: {
          current: 5,
          longest: 10,
          lastActivityDate: new Date(),
        },
        streakHistory: [],
        levelHistory: [],
        activityLog: [],
        bonuses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lessonsCompleted: initialLessonsCompleted,
        exercisesCompleted: initialExercisesCompleted,
        perfectScores: 0,
      } as UserLevel;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (userLevelRepository.findOne as jest.Mock).mockResolvedValue(
        initialUserLevel
      );
      (activityRepository.create as jest.Mock).mockImplementation(
        (activityData) => activityData
      ); // Usar activityRepository inyectado
      (activityRepository.save as jest.Mock).mockResolvedValue({}); // Usar activityRepository inyectado
      (userLevelRepository.save as jest.Mock).mockImplementation(
        (userLevelToSave) => userLevelToSave
      ); // Return the userLevel object after saving

      // Mock calculateLevel function
      const calculateLevelSpy = jest.spyOn(
        require("../../../lib/gamification"),
        "calculateLevel"
      );
      calculateLevelSpy.mockReturnValue(2); // Assume no level up initially

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
      expect(userLevelRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId.toString() } },
      });
      expect(activityRepository.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: activityType,
          description: description,
          user: user,
        })
      );
      expect(activityRepository.save as jest.Mock).toHaveBeenCalled();
      // Check if UserLevel stats were updated
      expect(result.points).toEqual(initialUserLevel.points + pointsToAward);
      expect(result.experience).toEqual(
        initialUserLevel.experience + pointsToAward
      );
      expect(result.lessonsCompleted).toEqual(initialLessonsCompleted + 1);
      expect(result.exercisesCompleted).toEqual(initialExercisesCompleted); // Should not change
      expect(result.perfectScores).toEqual(initialUserLevel.perfectScores); // Should not change

      expect(calculateLevelSpy).toHaveBeenCalledWith(result.points);
      expect(result.level).toEqual(initialUserLevel.level); // Verify level based on mock

      expect(userLevelRepository.save as jest.Mock).toHaveBeenCalledWith(result); // Check if the UserLevel object with updated stats was saved
      expect(result).toBeInstanceOf(UserLevel); // Check the returned type
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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const initialUserLevel = {
        id: "user-level-id",
        user: user,
        userId: user.id,
        level: 2,
        experience: 500,
        points: initialPoints,
        experienceToNextLevel: 600,
        consistencyStreak: {
          current: 5,
          longest: 10,
          lastActivityDate: new Date(),
        },
        streakHistory: [],
        levelHistory: [],
        activityLog: [],
        bonuses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lessonsCompleted: initialLessonsCompleted,
        exercisesCompleted: initialExercisesCompleted,
        perfectScores: initialPerfectScores,
      } as UserLevel;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (userLevelRepository.findOne as jest.Mock).mockResolvedValue(
        initialUserLevel
      );
      (activityRepository.create as jest.Mock).mockImplementation(
        (activityData) => activityData
      );
      (activityRepository.save as jest.Mock).mockResolvedValue({});
      (userLevelRepository.save as jest.Mock).mockImplementation(
        (userLevelToSave) => userLevelToSave
      );

      // Mock calculateLevel function
      const calculateLevelSpy = jest.spyOn(
        require("../../../lib/gamification"),
        "calculateLevel"
      );
      calculateLevelSpy.mockReturnValue(initialUserLevel.level); // Assume no level change

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
      expect(userLevelRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId.toString() } },
      });
      expect(activityRepository.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: activityType,
          description: description,
          user: user,
        })
      );
      expect(activityRepository.save as jest.Mock).toHaveBeenCalled();
      // Check if UserLevel stats were updated
      expect(result.points).toEqual(initialUserLevel.points + pointsToAward);
      expect(result.experience).toEqual(
        initialUserLevel.experience + pointsToAward
      );
      expect(result.lessonsCompleted).toEqual(initialLessonsCompleted); // Should not change
      expect(result.exercisesCompleted).toEqual(initialExercisesCompleted); // Should not change
      expect(result.perfectScores).toEqual(initialPerfectScores); // Should not change

      expect(calculateLevelSpy).toHaveBeenCalledWith(result.points);
      expect(result.level).toEqual(initialUserLevel.level); // Verify level based on mock

      expect(userLevelRepository.save as jest.Mock).toHaveBeenCalledWith(result);
      expect(result).toBeInstanceOf(UserLevel);
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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const initialUserLevel = {
        id: "user-level-id",
        user: user,
        userId: user.id,
        level: 2,
        experience: 500,
        points: 100,
        experienceToNextLevel: 600,
        consistencyStreak: {
          current: 5,
          longest: 10,
          lastActivityDate: new Date(),
        },
        streakHistory: [],
        levelHistory: [],
        activityLog: [],
        bonuses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lessonsCompleted: initialLessonsCompleted,
        exercisesCompleted: initialExercisesCompleted,
        perfectScores: initialPerfectScores,
      } as UserLevel;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (userLevelRepository.findOne as jest.Mock).mockResolvedValue(
        initialUserLevel
      );
      (activityRepository.create as jest.Mock).mockImplementation(
        (activityData) => activityData
      );
      (activityRepository.save as jest.Mock).mockResolvedValue({});
      (userLevelRepository.save as jest.Mock).mockImplementation(
        (userLevelToSave) => userLevelToSave
      );

      // Mock calculateLevel function
      const calculateLevelSpy = jest.spyOn(
        require("../../../lib/gamification"),
        "calculateLevel"
      );
      calculateLevelSpy.mockReturnValue(initialUserLevel.level); // Assume no level change

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
      expect(userLevelRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId.toString() } },
      });
      expect(activityRepository.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: activityType,
          description: description,
          user: user,
        })
      );
      expect(activityRepository.save as jest.Mock).toHaveBeenCalled();
      // Check if UserLevel stats were updated
      expect(result.points).toEqual(initialUserLevel.points + pointsToAward);
      expect(result.experience).toEqual(
        initialUserLevel.experience + pointsToAward
      );
      expect(result.lessonsCompleted).toEqual(initialLessonsCompleted); // Should not change
      expect(result.exercisesCompleted).toEqual(initialExercisesCompleted); // Should not change
      expect(result.perfectScores).toEqual(initialPerfectScores + 1); // Should update

      expect(calculateLevelSpy).toHaveBeenCalledWith(result.points);
      expect(result.level).toEqual(initialUserLevel.level); // Verify level based on mock

      expect(userLevelRepository.save as jest.Mock).toHaveBeenCalledWith(result);
      expect(result).toBeInstanceOf(UserLevel);
    });

    it("should throw an error if user is not found", async () => {
      // Arrange
      const userId = 999;
      const pointsToAward = 50;
      const activityType = "exercise";
      const description = "Completed exercise 1";

      (userRepository.findOne as jest.Mock).mockResolvedValue(undefined); // User not found

      // Act & Assert
      await expect(
        service.awardPoints(userId, pointsToAward, activityType, description)
      ).rejects.toThrowError(`User with ID ${userId} not found`);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(userLevelRepository.findOne).not.toHaveBeenCalled(); // UserLevel should not be searched if user not found
      expect(activityRepository.create).not.toHaveBeenCalled(); // Usar activityRepository inyectado
      expect(activityRepository.save).not.toHaveBeenCalled(); // Usar activityRepository inyectado
      expect(userLevelRepository.save).not.toHaveBeenCalled(); // UserLevel save should not be called
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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const initialUserLevel = {
        id: "user-level-id",
        user: user,
        userId: user.id,
        level: 2,
        experience: 500,
        points: 100,
        experienceToNextLevel: 600,
        consistencyStreak: {
          current: 5,
          longest: 10,
          lastActivityDate: new Date(),
        },
        streakHistory: [],
        levelHistory: [],
        activityLog: [],
        bonuses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lessonsCompleted: 5,
        exercisesCompleted: 10,
        perfectScores: 0,
      } as UserLevel;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (userLevelRepository.findOne as jest.Mock).mockResolvedValue(
        initialUserLevel
      );
      (activityRepository.create as jest.Mock).mockImplementation(
        (activityData) => activityData
      );
      (activityRepository.save as jest.Mock).mockRejectedValue(
        new Error("Failed to save activity")
      ); // Simulate save failure
      (userLevelRepository.save as jest.Mock).mockImplementation(
        (userLevelToSave) => userLevelToSave
      );

      // Mock calculateLevel function
      const calculateLevelSpy = jest.spyOn(
        require("../../../lib/gamification"),
        "calculateLevel"
      );
      calculateLevelSpy.mockReturnValue(initialUserLevel.level); // Assume no level change

      // Act & Assert
      await expect(
        service.awardPoints(userId, pointsToAward, activityType, description)
      ).rejects.toThrowError("Failed to save activity");
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(userLevelRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId.toString() } },
      });
      expect(activityRepository.create as jest.Mock).toHaveBeenCalledWith({
        type: activityType,
        description: description,
        user: user,
      });
      expect(activityRepository.save as jest.Mock).toHaveBeenCalled();
      expect(userLevelRepository.save).not.toHaveBeenCalled(); // UserLevel save should not be called if activity save fails
    });

    it("should throw an error if userLevelRepository.save fails after updating stats", async () => {
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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const initialUserLevel = {
        id: "user-level-id",
        user: user,
        userId: user.id,
        level: 2,
        experience: 500,
        points: 100,
        experienceToNextLevel: 600,
        consistencyStreak: {
          current: 5,
          longest: 10,
          lastActivityDate: new Date(),
        },
        streakHistory: [],
        levelHistory: [],
        activityLog: [],
        bonuses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lessonsCompleted: 5,
        exercisesCompleted: 10,
        perfectScores: 0,
      } as UserLevel;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (userLevelRepository.findOne as jest.Mock).mockResolvedValue(
        initialUserLevel
      );
      (activityRepository.create as jest.Mock).mockImplementation(
        (activityData) => activityData
      );
      (activityRepository.save as jest.Mock).mockResolvedValue({});
      (userLevelRepository.save as jest.Mock).mockRejectedValue(
        new Error("Failed to save user level")
      ); // Simulate userLevel save failure

      // Mock calculateLevel function
      const calculateLevelSpy = jest.spyOn(
        require("../../../lib/gamification"),
        "calculateLevel"
      );
      calculateLevelSpy.mockReturnValue(initialUserLevel.level); // Assume no level change

      // Act & Assert
      await expect(
        service.awardPoints(userId, pointsToAward, activityType, description)
      ).rejects.toThrowError("Failed to save user level");
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(userLevelRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId.toString() } },
      });
      expect(activityRepository.create as jest.Mock).toHaveBeenCalledWith({
        type: activityType,
        description: description,
        user: user,
      });
      expect(activityRepository.save as jest.Mock).toHaveBeenCalled();
      expect(userLevelRepository.save as jest.Mock).toHaveBeenCalledWith(initialUserLevel);
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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const newUserLevel = {
        user,
        userId: user.id,
        level: 1,
        experience: 0,
        points: 0,
        lessonsCompleted: 0,
        exercisesCompleted: 0,
        perfectScores: 0,
      }; // Include initial stats
      (userLevelRepository.create as jest.Mock).mockReturnValue(newUserLevel);
      (userLevelRepository.save as jest.Mock).mockResolvedValue(newUserLevel);

      // Act
      const result = await service.createUserLevel(user);

      // Assert
      expect(userLevelRepository.create as jest.Mock).toHaveBeenCalledWith({
        user,
        userId: user.id,
      });
      expect(userLevelRepository.save as jest.Mock).toHaveBeenCalledWith(newUserLevel);
      expect(result).toEqual(newUserLevel);
      expect(result).toBeInstanceOf(UserLevel); // Check the returned type
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
      expect(rewardRepository.find as jest.Mock).toHaveBeenCalled();
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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;
      (userRepository.findOne as jest.Mock).mockResolvedValue(user);

      // Act
      const result = await service.findByUserId(userId);

      // Assert
      expect(userRepository.findOne as jest.Mock).toHaveBeenCalledWith({
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
      expect(userRepository.findOne as jest.Mock).toHaveBeenCalledWith({
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

      // Mock User and UserLevel findOne and save for performance test
      const mockUser = (id: number) =>
        ({
          id: id.toString(),
          username: `testuser${id}`,
          email: `test${id}@example.com`,
          password: "password",
          firstName: "Test",
          lastName: "User",
          role: UserRole.USER,
          status: UserStatus.ACTIVE,
          languages: [],
          preferences: { notifications: false, language: "es", theme: "light" },
          culturalPoints: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }) as User;

      const mockUserLevel = (
        user: User,
        initialPoints: number,
        initialLevel: number
      ) =>
        ({
          id: `user-level-id-${user.id}`,
          user: user,
          userId: user.id,
          level: initialLevel,
          experience: initialPoints,
          points: initialPoints,
          experienceToNextLevel: 100,
          consistencyStreak: { current: 0, longest: 0, lastActivityDate: null },
          streakHistory: [],
          levelHistory: [],
          activityLog: [],
          bonuses: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          lessonsCompleted: 0,
          exercisesCompleted: 0,
          perfectScores: 0,
        }) as UserLevel;

      (userRepository.findOne as jest.Mock).mockImplementation(
        async ({ where: { id } }) => {
          const userId = parseInt(id);
          if (!isNaN(userId) && userId >= 0 && userId < numberOfUsers) {
            return mockUser(userId);
          }
          return undefined;
        }
      );

      (userLevelRepository.findOne as jest.Mock).mockImplementation(
        async ({
          where: {
            user: { id },
          },
        }) => {
          const userId = parseInt(id);
          if (!isNaN(userId) && userId >= 0 && userId < numberOfUsers) {
            const user = mockUser(userId);
            // Simulate finding an existing UserLevel
            return mockUserLevel(
              user,
              userId * 10,
              Math.floor(userId / 10) + 1
            ); // Example initial points and level
          }
          return undefined;
        }
      );

      (userLevelRepository.save as jest.Mock).mockImplementation(
        async (userLevelToSave) => userLevelToSave
      );

      // Mock calculateLevel function to return a fixed value for performance test
      const calculateLevelSpy = jest.spyOn(
        require("../../../lib/gamification"),
        "calculateLevel"
      );
      calculateLevelSpy.mockReturnValue(2); // Fixed level

      // Act
      const start = performance.now();
      const promises = [];
      for (let i = 0; i < numberOfUsers; i++) {
        promises.push(service.addPoints(i, pointsPerUser));
      }
      await Promise.all(promises);
      const end = performance.now();

      const duration = end - start;
      const averageTime = duration / numberOfUsers;

      // Assert
      console.log(
        `Processed ${numberOfUsers} users in ${duration}ms (average ${averageTime}ms per user)`
      );
      expect(averageTime).toBeLessThan(10); // Adjust the threshold as needed

      calculateLevelSpy.mockRestore(); // Restore the mocked function
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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const initialUserLevel = {
        id: "user-level-id",
        user: user,
        userId: user.id,
        level: initialLevel,
        experience: initialPoints,
        points: initialPoints,
        experienceToNextLevel: 100,
        consistencyStreak: { current: 0, longest: 0, lastActivityDate: null },
        streakHistory: [],
        levelHistory: [],
        activityLog: [],
        bonuses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lessonsCompleted: initialLessonsCompleted,
        exercisesCompleted: 0,
        perfectScores: 0,
      } as UserLevel;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (userLevelRepository.findOne as jest.Mock).mockResolvedValue(
        initialUserLevel
      );
      (activityRepository.create as jest.Mock).mockImplementation(
        (activityData) => activityData
      ); // Usar activityRepository inyectado
      (activityRepository.save as jest.Mock).mockResolvedValue({}); // Mock save to resolve
      (userLevelRepository.save as jest.Mock).mockImplementation(
        (userLevelToSave) => userLevelToSave
      ); // Return the userLevel object after saving

      // Mock calculateLevel function
      const calculateLevelSpy = jest.spyOn(
        require("../../../lib/gamification"),
        "calculateLevel"
      );
      calculateLevelSpy.mockReturnValue(initialLevel); // Assume no level up initially

      // Act: Simulate completing a lesson
      const updatedUserLevel = await service.awardPoints(
        userId,
        pointsForLesson,
        "lesson",
        "Completed Lesson 1"
      );

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(userLevelRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId.toString() } },
      });
      expect(activityRepository.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "lesson",
          description: "Completed Lesson 1",
          user: user,
        })
      );
      expect(activityRepository.save as jest.Mock).toHaveBeenCalled();
      // Check if UserLevel stats were updated
      expect(updatedUserLevel.points).toEqual(initialPoints + pointsForLesson);
      expect(updatedUserLevel.experience).toEqual(
        initialUserLevel.experience + pointsForLesson
      );
      expect(updatedUserLevel.lessonsCompleted).toEqual(
        initialLessonsCompleted + 1
      );
      expect(updatedUserLevel.exercisesCompleted).toEqual(
        initialUserLevel.exercisesCompleted
      ); // Should not change
      expect(updatedUserLevel.perfectScores).toEqual(
        initialUserLevel.perfectScores
      ); // Should not change

      expect(calculateLevelSpy).toHaveBeenCalledWith(updatedUserLevel.points);
      expect(updatedUserLevel.level).toEqual(initialLevel); // Verify level based on mock

      expect(userLevelRepository.save as jest.Mock).toHaveBeenCalledWith(updatedUserLevel); // Check if the UserLevel object with updated stats was saved
      expect(updatedUserLevel).toBeInstanceOf(UserLevel); // Check the returned type

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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const initialUserLevel = {
        id: "user-level-id",
        user: user,
        userId: user.id,
        level: initialLevel,
        experience: initialPoints,
        points: initialPoints,
        experienceToNextLevel: 200, // Example
        consistencyStreak: {
          current: 5,
          longest: 10,
          lastActivityDate: new Date(),
        }, // Example
        streakHistory: [], // Example
        levelHistory: [], // Example
        activityLog: [], // Example
        bonuses: [], // Example
        createdAt: new Date(),
        updatedAt: new Date(),
        lessonsCompleted: 0,
        exercisesCompleted: initialExercisesCompleted,
        perfectScores: initialPerfectScores,
      } as UserLevel;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (userLevelRepository.findOne as jest.Mock).mockResolvedValue(
        initialUserLevel
      );
      (activityRepository.create as jest.Mock).mockImplementation(
        (activityData) => activityData
      ); // Usar activityRepository inyectado
      (activityRepository.save as jest.Mock).mockResolvedValue({}); // Mock save to resolve
      (userLevelRepository.save as jest.Mock).mockImplementation(
        (userLevelToSave) => userLevelToSave
      ); // Return the userLevel object after saving

      // Mock calculateLevel function
      const calculateLevelSpy = jest.spyOn(
        require("../../../lib/gamification"),
        "calculateLevel"
      );
      calculateLevelSpy.mockReturnValue(initialLevel); // Assume no level up initially

      // Act: Simulate completing an exercise with perfect score
      const updatedUserLevel = await service.awardPoints(
        userId,
        pointsForExercise + pointsForPerfectScore, // Total points awarded
        "perfect-score",
        "Completed Exercise 5 with Perfect Score"
      );

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(userLevelRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId.toString() } },
      });
      expect(activityRepository.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "perfect-score",
          description: "Completed Exercise 5 with Perfect Score",
          user: user,
        })
      );
      expect(activityRepository.save as jest.Mock).toHaveBeenCalled();
      // Check if UserLevel stats were updated
      expect(updatedUserLevel.points).toEqual(
        initialPoints + pointsForExercise + pointsForPerfectScore
      );
      expect(updatedUserLevel.experience).toEqual(
        initialUserLevel.experience + pointsForExercise + pointsForPerfectScore
      );
      expect(updatedUserLevel.exercisesCompleted).toEqual(
        initialExercisesCompleted + 1
      );
      expect(updatedUserLevel.perfectScores).toEqual(initialPerfectScores + 1);
      expect(updatedUserLevel.lessonsCompleted).toEqual(
        initialUserLevel.lessonsCompleted
      ); // Should not change

      expect(calculateLevelSpy).toHaveBeenCalledWith(updatedUserLevel.points);
      expect(updatedUserLevel.level).toEqual(initialLevel); // Verify level based on mock

      expect(userLevelRepository.save as jest.Mock).toHaveBeenCalledWith(updatedUserLevel); // Check if the UserLevel object with updated stats was saved
      expect(updatedUserLevel).toBeInstanceOf(UserLevel); // Check the returned type

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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      const initialUserLevel = {
        id: "user-level-id",
        user: user,
        userId: user.id,
        level: initialLevel,
        experience: initialPoints,
        points: initialPoints,
        experienceToNextLevel: 100, // Example
        consistencyStreak: { current: 0, longest: 0, lastActivityDate: null }, // Example
        streakHistory: [], // Example
        levelHistory: [], // Example
        activityLog: [], // Example
        bonuses: [], // Example
        createdAt: new Date(),
        updatedAt: new Date(),
        lessonsCompleted: initialLessonsCompleted,
        exercisesCompleted: 0,
        perfectScores: 0,
      } as UserLevel;

      (userRepository.findOne as jest.Mock).mockResolvedValue(user);
      (userLevelRepository.findOne as jest.Mock).mockResolvedValue(
        initialUserLevel
      );
      (activityRepository.create as jest.Mock).mockImplementation(
        (activityData) => activityData
      );
      (activityRepository.save as jest.Mock).mockResolvedValue({});
      (userLevelRepository.save as jest.Mock).mockImplementation(
        (userLevelToSave) => userLevelToSave
      );

      // Mock calculateLevel function to return a new level
      const calculateLevelSpy = jest.spyOn(
        require("../../../lib/gamification"),
        "calculateLevel"
      );
      calculateLevelSpy.mockReturnValue(initialLevel + 1); // Simulate level up

      // Act: Simulate completing a lesson
      const updatedUserLevel = await service.awardPoints(
        userId,
        pointsForLesson,
        "lesson",
        "Completed Lesson 2"
      );

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId.toString() },
      });
      expect(userLevelRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId.toString() } },
      });
      expect(activityRepository.create as jest.Mock).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "lesson",
          description: "Completed Lesson 2",
          user: user,
        })
      );
      expect(activityRepository.save as jest.Mock).toHaveBeenCalled();
      // Check if UserLevel stats were updated
      expect(updatedUserLevel.points).toEqual(initialPoints + pointsForLesson);
      expect(updatedUserLevel.experience).toEqual(
        initialUserLevel.experience + pointsForLesson
      );
      expect(updatedUserLevel.lessonsCompleted).toEqual(
        initialLessonsCompleted + 1
      );
      expect(updatedUserLevel.exercisesCompleted).toEqual(
        initialUserLevel.exercisesCompleted
      ); // Should not change
      expect(updatedUserLevel.perfectScores).toEqual(
        initialUserLevel.perfectScores
      ); // Should not change

      expect(calculateLevelSpy).toHaveBeenCalledWith(updatedUserLevel.points);
      expect(updatedUserLevel.level).toEqual(initialLevel + 1); // Verify level up

      expect(userLevelRepository.save as jest.Mock).toHaveBeenCalledWith(updatedUserLevel);
      expect(updatedUserLevel).toBeInstanceOf(UserLevel);

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
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;

    const initialUserLevel = {
      id: "user-level-id",
      user: user,
      userId: user.id,
      level: initialLevel,
      experience: initialPoints,
      points: initialPoints,
      experienceToNextLevel: 200, // Example
      consistencyStreak: {
        current: 5,
        longest: 10,
        lastActivityDate: new Date(),
      }, // Example
      streakHistory: [], // Example
      levelHistory: [], // Example
      activityLog: [], // Example
      bonuses: [], // Example
      createdAt: new Date(),
      updatedAt: new Date(),
      lessonsCompleted: 0,
      exercisesCompleted: initialExercisesCompleted,
      perfectScores: 0,
    } as UserLevel;

    const reward = {
      id: rewardId,
      name: "Collab Badge",
      description: "Contributed to a collaborative project",
    };

    (userRepository.findOne as jest.Mock).mockResolvedValue(user);
    (userLevelRepository.findOne as jest.Mock).mockResolvedValue(
      initialUserLevel
    );
    (activityRepository.create as jest.Mock).mockImplementation(
      (activityData) => activityData
    );
    (activityRepository.save as jest.Mock).mockResolvedValue({});
    (userLevelRepository.save as jest.Mock).mockImplementation(
      (userLevelToSave) => userLevelToSave
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

    // Act: Simulate completing an activity that meets the criteria (e.g., a collaborative activity)
    // This test assumes that completing a "collab" activity type with enough exercises completed
    // triggers the badge grant logic within awardPoints.
    const updatedUserLevel = await service.awardPoints(
      userId,
      pointsForExercise,
      "collab", // Assuming "collab" activity type is linked to the badge
      "Contributed to a collaborative project"
    );

    // Assert
    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { id: userId.toString() },
    });
    expect(userLevelRepository.findOne).toHaveBeenCalledWith({
      where: { user: { id: userId.toString() } },
    });
    expect(activityRepository.create as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "collab",
        description: "Contributed to a collaborative project",
        user: user,
      })
    );
    expect(activityRepository.save as jest.Mock).toHaveBeenCalled();
    expect(userLevelRepository.save as jest.Mock).toHaveBeenCalledWith(updatedUserLevel); // UserLevel saved after points/experience update

    // Check if the badge was granted
    expect(rewardRepository.findOne as jest.Mock).toHaveBeenCalledWith({
      where: { id: "collab" }, // Assuming the reward ID is "collab"
    });
    expect(userRewardRepository.findOne as jest.Mock).toHaveBeenCalledWith({
      where: { userId: user.id, rewardId: reward.id },
    });
    expect(userRewardRepository.save as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: user.id,
        rewardId: reward.id,
      })
    );

    calculateLevelSpy.mockRestore();
  });

  it("should handle a large number of requests without performance degradation", async () => {
    // Arrange
    const numberOfUsers = 100;
    const pointsPerUser = 50;

    // Mock User and UserLevel findOne and save for performance test
    const mockUser = (id: number) =>
      ({
        id: id.toString(),
        username: `testuser${id}`,
        email: `test${id}@example.com`,
        password: "password",
        firstName: "Test",
        lastName: "User",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: "es", theme: "light" },
        culturalPoints: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }) as User;

    const mockUserLevel = (
      user: User,
      initialPoints: number,
      initialLevel: number
    ) =>
      ({
        id: `user-level-id-${user.id}`,
        user: user,
        userId: user.id,
        level: initialLevel,
        experience: initialPoints,
        points: initialPoints,
        experienceToNextLevel: 100,
        consistencyStreak: { current: 0, longest: 0, lastActivityDate: null },
        streakHistory: [],
        levelHistory: [],
        activityLog: [],
        bonuses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lessonsCompleted: 0,
        exercisesCompleted: 0,
        perfectScores: 0,
      }) as UserLevel;

      (userRepository.findOne as jest.Mock).mockImplementation(
        async ({ where: { id } }) => {
          const userId = parseInt(id);
          if (!isNaN(userId) && userId >= 0 && userId < numberOfUsers) {
            return mockUser(userId);
          }
          return undefined;
        }
      );

      (userLevelRepository.findOne as jest.Mock).mockImplementation(
        async ({
          where: {
            user: { id },
          },
        }) => {
          const userId = parseInt(id);
          if (!isNaN(userId) && userId >= 0 && userId < numberOfUsers) {
            const user = mockUser(userId);
            // Simulate finding an existing UserLevel
            return mockUserLevel(
              user,
              userId * 10,
              Math.floor(userId / 10) + 1
            ); // Example initial points and level
          }
          return undefined;
        }
      );

      (userLevelRepository.save as jest.Mock).mockImplementation(
        async (userLevelToSave) => userLevelToSave
      );

      // Mock calculateLevel function to return a fixed value for performance test
      const calculateLevelSpy = jest.spyOn(
        require("../../../lib/gamification"),
        "calculateLevel"
      );
      calculateLevelSpy.mockReturnValue(2); // Fixed level

      // Act
      const start = performance.now();
      const promises = [];
      for (let i = 0; i < numberOfUsers; i++) {
        promises.push(service.addPoints(i, pointsPerUser));
      }
      await Promise.all(promises);
      const end = performance.now();

      const duration = end - start;
      const averageTime = duration / numberOfUsers;

      // Assert
      console.log(
        `Processed ${numberOfUsers} users in ${duration}ms (average ${averageTime}ms per user)`
      );
      expect(averageTime).toBeLessThan(10); // Adjust the threshold as needed

      calculateLevelSpy.mockRestore(); // Restore the mocked function
    });
  });
});
