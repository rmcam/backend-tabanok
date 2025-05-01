import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLevelService } from './user-level.service';
import { UserLevel } from '../entities/user-level.entity';
import { User } from '../../../auth/entities/user.entity';
import { NotificationService } from '../../notifications/services/notification.service';

describe('UserLevelService', () => {
  let service: UserLevelService;
  let userLevelRepository: Repository<UserLevel>;
  let userRepository: Repository<User>;
  let notificationService: NotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserLevelService,
        {
          provide: getRepositoryToken(UserLevel),
          useClass: Repository, // Usar una clase mock o el Repository real si no se necesita mockear métodos específicos
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository, // Usar una clase mock o el Repository real si no se necesita mockear métodos específicos
        },
        {
          provide: NotificationService,
          useValue: { // Mockear NotificationService
            notifyLevelUp: jest.fn(),
            createNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserLevelService>(UserLevelService);
    userLevelRepository = module.get<Repository<UserLevel>>(getRepositoryToken(UserLevel));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    notificationService = module.get<NotificationService>(NotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Aquí se añadirán más pruebas para los métodos de UserLevelService

  describe('getUserLevel', () => {
    const userId = 'test-user-id';
    const mockUser = { id: userId, username: 'testuser' } as User;
    const mockUserLevel = {
      id: 'test-level-id',
      user: mockUser,
      currentLevel: 1,
      experiencePoints: 0,
      experienceToNextLevel: 100,
    } as UserLevel;

    it('should return user level if it exists', async () => {
      jest.spyOn(userLevelRepository, 'findOne').mockResolvedValue(mockUserLevel);

      const result = await service.getUserLevel(userId);

      expect(userLevelRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        relations: ['user'],
      });
      expect(result).toEqual(mockUserLevel);
    });

    it('should create a new user level if it does not exist but user exists', async () => {
      jest.spyOn(userLevelRepository, 'findOne').mockResolvedValue(undefined);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(userLevelRepository, 'create').mockReturnValue(mockUserLevel);
      jest.spyOn(userLevelRepository, 'save').mockResolvedValue(mockUserLevel);

      const result = await service.getUserLevel(userId);

      expect(userLevelRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        relations: ['user'],
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(userLevelRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        currentLevel: 1,
        experiencePoints: 0,
        experienceToNextLevel: 100,
      });
      expect(userLevelRepository.save).toHaveBeenCalledWith(mockUserLevel);
      expect(result).toEqual(mockUserLevel);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(userLevelRepository, 'findOne').mockResolvedValue(undefined);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.getUserLevel(userId)).rejects.toThrow(NotFoundException);
      expect(userLevelRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: userId } },
        relations: ['user'],
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
    });
  });

  describe('updateUserLevel', () => {
    const userId = 'test-user-id';
    const mockUser = { id: userId, username: 'testuser' } as User;
    let mockUserLevel: UserLevel;
    let calculateLevelSpy: jest.SpyInstance;

    beforeEach(() => {
      mockUserLevel = {
        id: 'test-level-id',
        user: mockUser,
        currentLevel: 1,
        experiencePoints: 0,
        experienceToNextLevel: 100,
      } as UserLevel;
      jest.spyOn(service, 'getUserLevel').mockResolvedValue(mockUserLevel);
      jest.spyOn(userLevelRepository, 'save').mockImplementation(async (userLevel) => userLevel as any); // Cast to any to match expected return type
      jest.spyOn(service as any, 'handleLevelUpRewards').mockResolvedValue(undefined); // Spy on private method
      // Spy on calculateLevel from the imported module
      calculateLevelSpy = jest.spyOn(require('../../../lib/gamification'), 'calculateLevel');
    });

    afterEach(() => {
      // Restore the spy after each test
      calculateLevelSpy.mockRestore();
    });

    it('should update experience points without leveling up', async () => {
      const updateDto = { experiencePoints: 50 };
      const expectedUserLevel = { ...mockUserLevel, experiencePoints: 50 };

      // Mock calculateLevel to return the same level
      calculateLevelSpy.mockReturnValue(mockUserLevel.currentLevel);

      const result = await service.updateUserLevel(userId, updateDto);

      expect(service.getUserLevel).toHaveBeenCalledWith(userId);
      expect(calculateLevelSpy).toHaveBeenCalledWith(updateDto.experiencePoints);
      expect(userLevelRepository.save).toHaveBeenCalledWith(expectedUserLevel);
      expect(result).toEqual(expectedUserLevel);
      expect(notificationService.notifyLevelUp).not.toHaveBeenCalled();
      expect(service['handleLevelUpRewards']).not.toHaveBeenCalled();
    });

    it('should update current level directly', async () => {
      const updateDto = { currentLevel: 5 };
      const expectedUserLevel = { ...mockUserLevel, currentLevel: 5 };

      // Mock calculateLevel to return the original level (as it's not used for direct level updates)
      calculateLevelSpy.mockReturnValue(mockUserLevel.currentLevel);

      const result = await service.updateUserLevel(userId, updateDto);

      expect(service.getUserLevel).toHaveBeenCalledWith(userId);
      expect(calculateLevelSpy).toHaveBeenCalledWith(mockUserLevel.experiencePoints); // Still called with original points
      expect(userLevelRepository.save).toHaveBeenCalledWith(expectedUserLevel);
      expect(result).toEqual(expectedUserLevel);
      // Notification and rewards should NOT be called if calculated level is not higher than the directly set level
      expect(notificationService.notifyLevelUp).not.toHaveBeenCalled();
      expect(service['handleLevelUpRewards']).not.toHaveBeenCalled();
    });

    it('should update experience points and trigger level up', async () => {
      const updateDto = { experiencePoints: 150 }; // Should trigger level up from 1 to 2
      const expectedUserLevel = { ...mockUserLevel, experiencePoints: 150, currentLevel: 2 };

      // Mock calculateLevel to return the next level
      calculateLevelSpy.mockReturnValue(2);

      const result = await service.updateUserLevel(userId, updateDto);

      expect(service.getUserLevel).toHaveBeenCalledWith(userId);
      expect(calculateLevelSpy).toHaveBeenCalledWith(updateDto.experiencePoints);
      expect(userLevelRepository.save).toHaveBeenCalledWith(expectedUserLevel);
      expect(result).toEqual(expectedUserLevel);
      expect(notificationService.notifyLevelUp).toHaveBeenCalledWith(userId, 2);
      expect(service['handleLevelUpRewards']).toHaveBeenCalledWith(userId, 2);
    });

    it('should add experience points and trigger update', async () => {
      const initialPoints = 50;
      const pointsToAdd = 70;
      const expectedPoints = initialPoints + pointsToAdd;
      const expectedUserLevel = { ...mockUserLevel, experiencePoints: expectedPoints };

      mockUserLevel.experiencePoints = initialPoints;
      jest.spyOn(service, 'getUserLevel').mockResolvedValue(mockUserLevel);
      calculateLevelSpy.mockReturnValue(mockUserLevel.currentLevel); // Assume no level up

      const result = await service.addExperiencePoints(userId, pointsToAdd);

      expect(service.getUserLevel).toHaveBeenCalledWith(userId);
      expect(userLevelRepository.save).toHaveBeenCalledWith(expectedUserLevel);
      expect(result).toEqual(expectedUserLevel);
      expect(notificationService.notifyLevelUp).not.toHaveBeenCalled();
      expect(service['handleLevelUpRewards']).not.toHaveBeenCalled();
    });
  });

  describe('addExperiencePoints', () => {
    const userId = 'test-user-id';
    const mockUser = { id: userId, username: 'testuser' } as User;
    let mockUserLevel: UserLevel;
    let calculateLevelSpy: jest.SpyInstance;
    let updateUserLevelSpy: jest.SpyInstance;


    beforeEach(() => {
      mockUserLevel = {
        id: 'test-level-id',
        user: mockUser,
        currentLevel: 1,
        experiencePoints: 0,
        experienceToNextLevel: 100,
      } as UserLevel;
      // Spy on getUserLevel to return the mock user level
      jest.spyOn(service, 'getUserLevel').mockResolvedValue(mockUserLevel);
      // Spy on updateUserLevel to prevent it from executing its full logic during addExperiencePoints tests
      updateUserLevelSpy = jest.spyOn(service, 'updateUserLevel').mockResolvedValue(mockUserLevel);
    });

    afterEach(() => {
      // Restore the spy after each test
      updateUserLevelSpy.mockRestore();
    });

    it('should call updateUserLevel with updated experience points', async () => {
      const pointsToAdd = 50;
      const initialPoints = mockUserLevel.experiencePoints;
      const expectedPoints = initialPoints + pointsToAdd;

      await service.addExperiencePoints(userId, pointsToAdd);

      expect(service.getUserLevel).toHaveBeenCalledWith(userId);
      expect(updateUserLevelSpy).toHaveBeenCalledWith(userId, { experiencePoints: expectedPoints });
    });
  });

  describe('calculateExperienceForNextLevel', () => {
    it('should calculate experience for the next level correctly', () => {
      const currentLevel = 1;
      const expectedExperience = Math.pow(currentLevel + 1, 2) * 100; // (1+1)^2 * 100 = 400

      // Access the private method using bracket notation
      const result = service['calculateExperienceForNextLevel'](currentLevel);

      expect(result).toBe(expectedExperience);
    });

    it('should calculate experience for a higher level correctly', () => {
      const currentLevel = 5;
      const expectedExperience = Math.pow(currentLevel + 1, 2) * 100; // (5+1)^2 * 100 = 3600

      // Access the private method using bracket notation
      const result = service['calculateExperienceForNextLevel'](currentLevel);

      expect(result).toBe(expectedExperience);
    });
  });

  describe('handleLevelUpRewards', () => {
    const userId = 'test-user-id';
    const newLevel = 5;

    it('should create a notification for level up rewards', async () => {
      // Access the private method using bracket notation
      await service['handleLevelUpRewards'](userId, newLevel);

      expect(notificationService.createNotification).toHaveBeenCalledWith({
        userId,
        type: 'level_up', // Corrected to lowercase
        title: '¡Recompensas por Nuevo Nivel!',
        message: `Has desbloqueado nuevas recompensas por alcanzar el nivel ${newLevel}`,
        priority: 'high', // Corrected to lowercase
        metadata: {
          level: newLevel,
          rewards: ['Lista de recompensas específicas del nivel'],
        },
      });
    });
  });
});
