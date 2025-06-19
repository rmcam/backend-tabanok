import { Test, TestingModule } from '@nestjs/testing';
import { UserLevelService } from './user-level.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLevel } from '../entities/user-level.entity';
import { User } from '../../../auth/entities/user.entity';

describe('UserLevelService', () => {
  let service: UserLevelService;
  let userLevelRepository: Repository<UserLevel>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserLevelService,
        {
          provide: getRepositoryToken(UserLevel),
          useValue: {
            // Mock methods of UserLevelRepository used in UserLevelService
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            // Add other methods as needed
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            // Mock methods of UserRepository used in UserLevelService
            findOne: jest.fn(),
            // Add other methods as needed
          },
        },
      ],
    }).compile();

    service = module.get<UserLevelService>(UserLevelService);
    userLevelRepository = module.get<Repository<UserLevel>>(getRepositoryToken(UserLevel));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUserLevel', () => {
    it('should create a new user level entry for a user', async () => {
      // Arrange
      const mockUser = { id: 'user-uuid' } as User;
      const mockUserLevel: UserLevel = {
        id: 'user-level-uuid', // Add ID
        user: mockUser,
        level: 1,
        experience: 0,
        points: 0,
        culturalPoints: 0, // Add culturalPoints
        experienceToNextLevel: 0, // Add missing fields with default values
        consistencyStreak: { current: 0, longest: 0, lastActivityDate: null },
        streakHistory: [],
        levelHistory: [],
        activityLog: [],
        bonuses: [],
        lessonsCompleted: 0,
        exercisesCompleted: 0,
        perfectScores: 0,
        createdAt: new Date(), // Add dates
        updatedAt: new Date(),
      };

      jest.spyOn(userLevelRepository, 'create').mockReturnValue(mockUserLevel);
      jest.spyOn(userLevelRepository, 'save').mockResolvedValue(mockUserLevel);

      // Act
      const result = await service.createUserLevel(mockUser);

      // Assert
      expect(userLevelRepository.create).toHaveBeenCalledWith({ user: mockUser }); // Remove userId
      expect(userLevelRepository.save).toHaveBeenCalledWith(mockUserLevel);
      expect(result).toEqual(mockUserLevel);
    });
  });

  describe('findByUser', () => {
    it('should return the user level entry for a given user', async () => {
      // Arrange
      const mockUser = { id: 'user-uuid' } as User;
      const mockUserLevel: UserLevel = {
        id: 'user-level-uuid',
        user: mockUser,
        level: 1,
        experience: 0,
        points: 0,
        culturalPoints: 0,
        experienceToNextLevel: 0,
        consistencyStreak: { current: 0, longest: 0, lastActivityDate: null },
        streakHistory: [],
        levelHistory: [],
        activityLog: [],
        bonuses: [],
        lessonsCompleted: 0,
        exercisesCompleted: 0,
        perfectScores: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(userLevelRepository, 'findOne').mockResolvedValue(mockUserLevel);

      // Act
      const result = await service.findByUser(mockUser);

      // Assert
      expect(userLevelRepository.findOne).toHaveBeenCalledWith({ where: { user: { id: mockUser.id } } });
      expect(result).toEqual(mockUserLevel);
    });

    it('should return null if the user level entry is not found', async () => {
      // Arrange
      const mockUser = { id: 'user-uuid' } as User;

      jest.spyOn(userLevelRepository, 'findOne').mockResolvedValue(null);

      // Act
      const result = await service.findByUser(mockUser);

      // Assert
      expect(userLevelRepository.findOne).toHaveBeenCalledWith({ where: { user: { id: mockUser.id } } });
      expect(result).toBeNull();
    });
  });

  describe('updatePoints', () => {
    it('should update the points of a user level entry', async () => {
      // Arrange
      const mockUser = { id: 'user-uuid' } as User;
      const initialUserLevel: UserLevel = {
        id: 'user-level-uuid',
        user: mockUser,
        level: 1,
        experience: 0,
        points: 100,
        culturalPoints: 0,
        experienceToNextLevel: 0,
        consistencyStreak: { current: 0, longest: 0, lastActivityDate: null },
        streakHistory: [],
        levelHistory: [],
        activityLog: [],
        bonuses: [],
        lessonsCompleted: 0,
        exercisesCompleted: 0,
        perfectScores: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const pointsToAdd = 50;

      jest.spyOn(userLevelRepository, 'save').mockResolvedValue({ ...initialUserLevel, points: initialUserLevel.points + pointsToAdd });

      // Act
      const result = await service.updatePoints(initialUserLevel, pointsToAdd);

      // Assert
      expect(userLevelRepository.save).toHaveBeenCalledWith({ ...initialUserLevel, points: initialUserLevel.points + pointsToAdd });
      expect(result.points).toEqual(initialUserLevel.points + pointsToAdd);
    });
  });

  describe('updateLevel', () => {
    it('should update the level of a user level entry', async () => {
      // Arrange
      const mockUser = { id: 'user-uuid' } as User;
      const initialUserLevel: UserLevel = {
        id: 'user-level-uuid',
        user: mockUser,
        level: 1,
        experience: 0,
        points: 100,
        culturalPoints: 0,
        experienceToNextLevel: 0,
        consistencyStreak: { current: 0, longest: 0, lastActivityDate: null },
        streakHistory: [],
        levelHistory: [],
        activityLog: [],
        bonuses: [],
        lessonsCompleted: 0,
        exercisesCompleted: 0,
        perfectScores: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const newLevel = 2;

      jest.spyOn(userLevelRepository, 'save').mockResolvedValue({ ...initialUserLevel, level: newLevel });

      // Act
      const result = await service.updateLevel(initialUserLevel, newLevel);

      // Assert
      expect(userLevelRepository.save).toHaveBeenCalledWith({ ...initialUserLevel, level: newLevel });
      expect(result.level).toEqual(newLevel);
    });
  });

  describe('updateStats', () => {
    it('should update specific stats of a user level entry', async () => {
      // Arrange
      const mockUser = { id: 'user-uuid' } as User;
      const initialUserLevel: UserLevel = {
        id: 'user-level-uuid',
        user: mockUser,
        level: 1,
        experience: 0,
        points: 100,
        culturalPoints: 0,
        experienceToNextLevel: 0,
        consistencyStreak: { current: 0, longest: 0, lastActivityDate: null },
        streakHistory: [],
        levelHistory: [],
        activityLog: [],
        bonuses: [],
        lessonsCompleted: 0,
        exercisesCompleted: 0,
        perfectScores: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const statsToUpdate = { lessonsCompleted: 5, perfectScores: 2 };

      jest.spyOn(userLevelRepository, 'save').mockResolvedValue({ ...initialUserLevel, ...statsToUpdate });

      // Act
      const result = await service.updateStats(initialUserLevel, statsToUpdate);

      // Assert
      expect(userLevelRepository.save).toHaveBeenCalledWith({ ...initialUserLevel, ...statsToUpdate });
      expect(result.lessonsCompleted).toEqual(statsToUpdate.lessonsCompleted);
      expect(result.perfectScores).toEqual(statsToUpdate.perfectScores);
      // Check that other fields are not changed
      expect(result.points).toEqual(initialUserLevel.points);
      expect(result.level).toEqual(initialUserLevel.level);
    });
  });
});
