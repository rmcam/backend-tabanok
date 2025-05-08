import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken, TypeOrmModule } from "@nestjs/typeorm"; // Importar TypeOrmModule
import { Repository } from "typeorm"; // Importar Repository
import { User } from "@/auth/entities/user.entity"; // Importar la entidad User
import { UserRepository } from "@/auth/repositories/user.repository";
import { UserAchievement } from "../entities/user-achievement.entity"; // Importar la entidad UserAchievement
import { UserLevel } from "@/features/gamification/entities/user-level.entity"; // Importar la entidad UserLevel

import { UserMission } from "../entities/user-mission.entity"; // Importar la entidad UserMission
import { UserReward } from "../entities/user-reward.entity"; // Importar la entidad UserReward
import { UserAchievementRepository } from "../repositories/user-achievement.repository";
import { UserLevelRepository } from "@/features/gamification/repositories/user-level.repository";
import { UserMissionRepository } from "../repositories/user-mission.repository";
import { LeaderboardService } from "./leaderboard.service";
import { Gamification } from "../entities/gamification.entity"; // Importar la entidad Gamification
import { GamificationRepository } from "../repositories/gamification.repository"; // Importar el repositorio de Gamification

// Mock GamificationRepository
class MockGamificationRepository {
  findOne = jest.fn();
}

describe("LeaderboardService", () => {
  let service: LeaderboardService;
  let mockUserRepository: Partial<UserRepository & { find: jest.Mock }>;
  let mockUserLevelRepository: Partial<
    UserLevelRepository & { findOne: jest.Mock }
  >;
  let mockUserAchievementRepository: Partial<
    UserAchievementRepository & { count: jest.Mock }
  >;
  let mockUserMissionRepository: Partial<
    UserMissionRepository & { count: jest.Mock }
  >;
  let mockUserRewardRepository: Partial<
    Repository<UserReward> & { count: jest.Mock }
  >; // Usar Repository<UserReward>
  let mockGamificationRepository: MockGamificationRepository; // Declarar mock para GamificationRepository

  beforeEach(async () => {
    mockUserRepository = { find: jest.fn() };
    mockUserLevelRepository = { findOne: jest.fn().mockResolvedValue(null) }; // Inicializar con mock function
    mockUserAchievementRepository = { count: jest.fn().mockResolvedValue(0) }; // Inicializar con mock function
    mockUserMissionRepository = { count: jest.fn().mockResolvedValue(0) }; // Inicializar con mock function
    mockUserRewardRepository = { count: jest.fn().mockResolvedValue(0) }; // Inicializar con mock function
    mockGamificationRepository = new MockGamificationRepository(); // Inicializar mock para GamificationRepository

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardService,
        {
          provide: getRepositoryToken(User), // Usar el token de la entidad User para el repositorio personalizado
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(UserLevel), // Usar la entidad UserLevel
          useValue: mockUserLevelRepository,
        },
        {
          provide: getRepositoryToken(UserAchievement), // Usar la entidad UserAchievement
          useValue: mockUserAchievementRepository,
        },
        {
          provide: getRepositoryToken(UserMission), // Usar la entidad UserMission
          useValue: mockUserMissionRepository,
        },
        {
          provide: getRepositoryToken(UserReward), // Usar la entidad UserReward
          useValue: mockUserRewardRepository, // Usar Repository<UserReward>
        },
        {
          provide: getRepositoryToken(Gamification), // Proveer mock para GamificationRepository
          useClass: MockGamificationRepository, // Usar la clase mock
        },
      ],
    }).compile();

    service = module.get<LeaderboardService>(LeaderboardService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getLeaderboard", () => {
    it("should return a sorted leaderboard with calculated scores and ranks", async () => {
      const mockUsers = [
        { id: "user1", username: "Alice" },
        { id: "user2", username: "Bob" },
        { id: "user3", username: "Charlie" },
      ];

      const mockUserLevels = [
        { user: { id: "user1" }, currentLevel: 5, experiencePoints: 150 },
        { user: { id: "user2" }, currentLevel: 3, experiencePoints: 80 },
        { user: { id: "user3" }, currentLevel: 7, experiencePoints: 220 },
      ];

      const mockUserAchievements = [
        { user: { id: "user1" } },
        { user: { id: "user1" } }, // Alice: 2 achievements
        { user: { id: "user2" } }, // Bob: 1 achievement
        { user: { id: "user3" } },
        { user: { id: "user3" } },
        { user: { id: "user3" } }, // Charlie: 3 achievements
      ];

      const mockUserMissions = [
        { user: { id: "user1" } },
        { user: { id: "user1" } },
        { user: { id: "user1" } }, // Alice: 3 missions
        { user: { id: "user2" } },
        { user: { id: "user2" } }, // Bob: 2 missions
        { user: { id: "user3" } }, // Charlie: 1 mission
      ];

      const mockUserRewards = [
        { user: { id: "user1" } }, // Alice: 1 reward
        { user: { id: "user2" } },
        { user: { id: "user2" } },
        { user: { id: "user2" } },
        { user: { id: "user2" } }, // Bob: 4 rewards
        { user: { id: "user3" } },
        { user: { id: "user3" } }, // Charlie: 2 rewards
      ];

      mockUserRepository.find = jest.fn().mockResolvedValue(mockUsers);
      mockUserLevelRepository.findOne = jest.fn().mockImplementation(
        ({
          where: {
            user: { id },
          },
        }) => {
          return Promise.resolve(
            mockUserLevels.find((level) => level.user.id === id)
          );
        }
      );
      mockUserAchievementRepository.count = jest.fn().mockImplementation(
        ({
          where: {
            user: { id },
          },
        }) => {
          return Promise.resolve(
            mockUserAchievements.filter((ua) => ua.user.id === id).length
          );
        }
      );
      mockUserMissionRepository.count = jest.fn().mockImplementation(
        ({
          where: {
            user: { id },
          },
        }) => {
          return Promise.resolve(
            mockUserMissions.filter((um) => um.user.id === id).length
          );
        }
      );
      mockUserRewardRepository.count = jest.fn().mockImplementation(
        ({
          where: {
            user: { id },
          },
        }) => {
          return Promise.resolve(
            mockUserRewards.filter((ur) => ur.user.id === id).length
          );
        }
      );

      const leaderboard = await service.getLeaderboard();

      // Expected scores:
      // Alice: (5 * 100 + 150) + (2 * 50) + (3 * 25) + (1 * 10) = 650 + 100 + 75 + 10 = 835
      // Bob: (3 * 100 + 80) + (1 * 50) + (2 * 25) + (4 * 10) = 380 + 50 + 50 + 40 = 520
      // Charlie: (7 * 100 + 220) + (3 * 50) + (1 * 25) + (2 * 10) = 920 + 150 + 25 + 20 = 1115

      // Expected sorted leaderboard by score (descending): Charlie, Alice, Bob
      expect(leaderboard).toHaveLength(3);
      expect(leaderboard[0]).toEqual({
        userId: "user3",
        username: "Charlie",
        score: 1115,
        rank: 1,
      });
      expect(leaderboard[1]).toEqual({
        userId: "user1",
        username: "Alice",
        score: 835,
        rank: 2,
      });
      expect(leaderboard[2]).toEqual({
        userId: "user2",
        username: "Bob",
        score: 520,
        rank: 3,
      });

      expect(mockUserRepository.find).toHaveBeenCalled();
      expect(mockUserLevelRepository.findOne).toHaveBeenCalledTimes(
        mockUsers.length
      );
      expect(mockUserAchievementRepository.count).toHaveBeenCalledTimes(
        mockUsers.length
      );
      expect(mockUserMissionRepository.count).toHaveBeenCalledTimes(
        mockUsers.length
      );
      expect(mockUserRewardRepository.count).toHaveBeenCalledTimes(
        mockUsers.length
      );
    });

    it("should handle users with no related gamification data", async () => {
      const mockUsers = [
        { id: "user1", username: "Alice" },
        { id: "user2", username: "Bob" }, // Bob has no related data
      ];

      const mockUserLevels = [
        { user: { id: "user1" }, currentLevel: 5, experiencePoints: 150 },
      ];

      mockUserRepository.find = jest.fn().mockResolvedValue(mockUsers);
      mockUserLevelRepository.findOne = jest.fn().mockImplementation(
        ({
          where: {
            user: { id },
          },
        }) => {
          return Promise.resolve(
            mockUserLevels.find((level) => level.user.id === id) || null
          );
        }
      );
      mockUserAchievementRepository.count = jest.fn().mockResolvedValue(0);
      mockUserMissionRepository.count = jest.fn().mockResolvedValue(0);
      mockUserRewardRepository.count = jest.fn().mockResolvedValue(0);

      const leaderboard = await service.getLeaderboard();

      // Expected scores:
      // Alice: (5 * 100 + 150) + (0 * 50) + (0 * 25) + (0 * 10) = 650
      // Bob: (0 * 100 + 0) + (0 * 50) + (0 * 25) + (0 * 10) = 0 (assuming default score calculation for missing level)

      // Expected sorted leaderboard: Alice, Bob
      expect(leaderboard).toHaveLength(2);
      expect(leaderboard[0]).toEqual({
        userId: "user1",
        username: "Alice",
        score: 650,
        rank: 1,
      });
      expect(leaderboard[1]).toEqual({
        userId: "user2",
        username: "Bob",
        score: 0,
        rank: 2,
      }); // Score is 0 if UserLevel is not found

      expect(mockUserRepository.find).toHaveBeenCalled();
      expect(mockUserLevelRepository.findOne).toHaveBeenCalledTimes(
        mockUsers.length
      );
      expect(mockUserAchievementRepository.count).toHaveBeenCalledTimes(
        mockUsers.length
      );
      expect(mockUserMissionRepository.count).toHaveBeenCalledTimes(
        mockUsers.length
      );
      expect(mockUserRewardRepository.count).toHaveBeenCalledTimes(
        mockUsers.length
      );

      // Restore console.warn after the test
      jest.restoreAllMocks();
    });

    it("should handle errors during data retrieval", async () => {
      const mockError = new Error("Database error");
      mockUserRepository.find = jest.fn().mockRejectedValue(mockError);

      const consoleErrorSpy = jest.spyOn(console, "error");

      await expect(service.getLeaderboard()).rejects.toThrow("Database error");

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error al obtener la tabla de clasificación:",
        mockError
      );
      expect(mockUserRepository.find).toHaveBeenCalled();
      // Ensure other repository methods were not called after the error
      expect(mockUserLevelRepository.findOne).not.toHaveBeenCalled();
      expect(mockUserAchievementRepository.count).not.toHaveBeenCalled();
      expect(mockUserMissionRepository.count).not.toHaveBeenCalled();
      expect(mockUserRewardRepository.count).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore(); // Restore console.error spy
    });
  });

  describe("getUserRank", () => {
    it("should return the correct rank for a given user ID", async () => {
      const mockLeaderboard = [
        { userId: "user3", username: "Charlie", score: 1115, rank: 1 },
        { userId: "user1", username: "Alice", score: 835, rank: 2 },
        { userId: "user2", username: "Bob", score: 520, rank: 3 },
      ];

      // Mock the internal getLeaderboard call
      jest.spyOn(service, "getLeaderboard").mockResolvedValue(mockLeaderboard);

      const user1Rank = await service.getUserRank("user1");
      const user3Rank = await service.getUserRank("user3");

      expect(user1Rank).toBe(2);
      expect(user3Rank).toBe(1);
      expect(service.getLeaderboard).toHaveBeenCalledTimes(2); // Called once for each getUserRank call
    });

    it("should return 0 if the user is not found in the leaderboard", async () => {
      const mockLeaderboard = [
        { userId: "user1", username: "Alice", score: 835, rank: 1 },
        { userId: "user2", username: "Bob", score: 520, rank: 2 },
      ];

      jest.spyOn(service, "getLeaderboard").mockResolvedValue(mockLeaderboard);

      const userRank = await service.getUserRank("user99"); // User not in mockLeaderboard

      expect(userRank).toBe(0);
      expect(service.getLeaderboard).toHaveBeenCalledTimes(1);
    });

    it("should handle errors when calling getLeaderboard", async () => {
      const mockError = new Error("Leaderboard calculation failed");
      jest.spyOn(service, "getLeaderboard").mockRejectedValue(mockError);

      await expect(service.getUserRank("user1")).rejects.toThrow(
        "Leaderboard calculation failed"
      );
      expect(service.getLeaderboard).toHaveBeenCalledTimes(1);
    });
  });
});
