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
});
