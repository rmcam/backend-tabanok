import { Test, TestingModule } from '@nestjs/testing';
import { UserLevelController } from './user-level.controller';
import { UserLevelService } from '../services/user-level.service';
import { UserLevel } from '../entities/user-level.entity';
import { UpdateUserLevelDto } from '../dto/update-user-level.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { NotFoundException } from '@nestjs/common';

describe('UserLevelController', () => {
  let controller: UserLevelController;
  let service: UserLevelService;

  const mockUserLevelService = {
    getUserLevel: jest.fn(),
    updateUserLevel: jest.fn(),
    addExperiencePoints: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserLevelController],
      providers: [
        {
          provide: UserLevelService,
          useValue: mockUserLevelService,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard) // Sobrescribir el guard JWT
    .useValue({ canActivate: () => true }) // Permitir siempre el acceso para pruebas de controlador
    .compile();

    controller = module.get<UserLevelController>(UserLevelController);
    service = module.get<UserLevelService>(UserLevelService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserLevel', () => {
    it('should return user level for a user', async () => {
      const userId = 'test-user-id';
      const expectedUserLevel: UserLevel = {
        id: 'level-uuid',
        userId,
        points: 0, // Añadir propiedad requerida
        currentLevel: 1, // Usar currentLevel
        experiencePoints: 0,
        experienceToNextLevel: 100, // Añadir propiedad requerida
        consistencyStreak: { current: 0, longest: 0, lastActivityDate: new Date() }, // Añadir propiedad requerida
        streakHistory: [], // Añadir propiedad requerida
        achievements: [], // Añadir propiedad opcional
        milestones: [], // Añadir propiedad opcional
        levelHistory: [], // Añadir propiedad requerida
        activityLog: [], // Añadir propiedad requerida
        bonuses: [], // Añadir propiedad requerida
        createdAt: new Date(),
        updatedAt: new Date(),
        user: null, // Assuming user relation is not loaded by default
      };

      mockUserLevelService.getUserLevel.mockResolvedValue(expectedUserLevel);

      const result = await controller.getUserLevel(userId);

      expect(result).toEqual(expectedUserLevel);
      expect(mockUserLevelService.getUserLevel).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user level not found', async () => {
        const userId = 'non-existent-user';

        mockUserLevelService.getUserLevel.mockRejectedValue(new NotFoundException());

        await expect(controller.getUserLevel(userId)).rejects.toThrow(NotFoundException);
        expect(mockUserLevelService.getUserLevel).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateUserLevel', () => {
    it('should update user level', async () => {
      const userId = 'test-user-id';
      const updateUserLevelDto: UpdateUserLevelDto = { currentLevel: 5, experiencePoints: 500 }; // Usar currentLevel
      const expectedUserLevel: UserLevel = {
        id: 'level-uuid',
        userId,
        points: 0, // Añadir propiedad requerida
        currentLevel: 5, // Usar currentLevel
        experiencePoints: 500,
        experienceToNextLevel: 100, // Añadir propiedad requerida
        consistencyStreak: { current: 0, longest: 0, lastActivityDate: new Date() }, // Añadir propiedad requerida
        streakHistory: [], // Añadir propiedad requerida
        achievements: [], // Añadir propiedad opcional
        milestones: [], // Añadir propiedad opcional
        levelHistory: [], // Añadir propiedad requerida
        activityLog: [], // Añadir propiedad requerida
        bonuses: [], // Añadir propiedad requerida
        createdAt: new Date(),
        updatedAt: new Date(),
        user: null,
      };

      mockUserLevelService.updateUserLevel.mockResolvedValue(expectedUserLevel);

      const result = await controller.updateUserLevel(userId, updateUserLevelDto);

      expect(result).toEqual(expectedUserLevel);
      expect(mockUserLevelService.updateUserLevel).toHaveBeenCalledWith(userId, updateUserLevelDto);
    });

    it('should throw NotFoundException if user level not found', async () => {
        const userId = 'non-existent-user';
        const updateUserLevelDto: UpdateUserLevelDto = { currentLevel: 5 }; // Usar currentLevel

        mockUserLevelService.updateUserLevel.mockRejectedValue(new NotFoundException());

        await expect(controller.updateUserLevel(userId, updateUserLevelDto)).rejects.toThrow(NotFoundException);
        expect(mockUserLevelService.updateUserLevel).toHaveBeenCalledWith(userId, updateUserLevelDto);
    });
  });

  describe('addXp', () => {
    it('should add experience points to a user', async () => {
      const userId = 'test-user-id';
      const xpToAdd = 100;
      const expectedUserLevel: UserLevel = {
        id: 'level-uuid',
        userId,
        points: 0, // Añadir propiedad requerida
        currentLevel: 1, // Usar currentLevel
        experiencePoints: 100,
        experienceToNextLevel: 100, // Añadir propiedad requerida
        consistencyStreak: { current: 0, longest: 0, lastActivityDate: new Date() }, // Añadir propiedad requerida
        streakHistory: [], // Añadir propiedad requerida
        achievements: [], // Añadir propiedad opcional
        milestones: [], // Añadir propiedad opcional
        levelHistory: [], // Añadir propiedad requerida
        activityLog: [], // Añadir propiedad requerida
        bonuses: [], // Añadir propiedad requerida
        createdAt: new Date(),
        updatedAt: new Date(),
        user: null,
      };

      mockUserLevelService.addExperiencePoints.mockResolvedValue(expectedUserLevel);

      const result = await controller.addXp(userId, xpToAdd);

      expect(result).toEqual(expectedUserLevel);
      expect(mockUserLevelService.addExperiencePoints).toHaveBeenCalledWith(userId, xpToAdd);
    });

    it('should throw NotFoundException if user level not found', async () => {
        const userId = 'non-existent-user';
        const xpToAdd = 100;

        mockUserLevelService.addExperiencePoints.mockRejectedValue(new NotFoundException());

        await expect(controller.addXp(userId, xpToAdd)).rejects.toThrow(NotFoundException);
        expect(mockUserLevelService.addExperiencePoints).toHaveBeenCalledWith(userId, xpToAdd);
    });
  });
});
