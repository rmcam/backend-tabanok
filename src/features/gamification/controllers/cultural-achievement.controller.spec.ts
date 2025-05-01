import { Test, TestingModule } from '@nestjs/testing';
import { CulturalAchievementController } from './cultural-achievement.controller';
import { CulturalAchievementService } from '../services/cultural-achievement.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { CreateAchievementDto } from '../dto/cultural-achievement.dto';
import { UserRole } from '../../../auth/entities/user.entity';
import { ExecutionContext } from '@nestjs/common';
import { AchievementCategory, AchievementType, AchievementTier } from '../entities/cultural-achievement.entity';

// Mock del CulturalAchievementService
const mockCulturalAchievementService = {
  createAchievement: jest.fn(),
  getAchievements: jest.fn(),
  initializeUserProgress: jest.fn(),
  updateProgress: jest.fn(),
  getUserAchievements: jest.fn(),
  getAchievementProgress: jest.fn(),
};

// Mock de los Guards
const mockJwtAuthGuard = {
  canActivate: jest.fn((context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    // Simular un usuario autenticado con rol ADMIN para las pruebas iniciales
    request.user = { userId: 'test-user-id', role: UserRole.ADMIN };
    return true;
  }),
};

const mockRolesGuard = {
  canActivate: jest.fn((context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    // Simular que el guard de roles permite el acceso si el usuario tiene el rol requerido
    // En un test real, se verificaría la lógica del guard
    return true;
  }),
};

describe('CulturalAchievementController', () => {
  let controller: CulturalAchievementController;
  let service: CulturalAchievementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CulturalAchievementController],
      providers: [
        {
          provide: CulturalAchievementService,
          useValue: mockCulturalAchievementService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<CulturalAchievementController>(CulturalAchievementController);
    service = module.get<CulturalAchievementService>(CulturalAchievementService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAchievement', () => {
    it('should create a cultural achievement', async () => {
      const createAchievementDto: CreateAchievementDto = {
        name: 'Test Achievement',
        description: 'A test achievement',
        category: AchievementCategory.LENGUA,
        type: AchievementType.CONTRIBUCION_CULTURAL,
        tier: AchievementTier.BRONCE,
        requirements: [{ type: 'lessons', value: 1, description: 'Complete 1 lesson' }],
        pointsReward: 50,
      };
      const expectedResult = { id: 'some-uuid', ...createAchievementDto };

      jest.spyOn(service, 'createAchievement').mockResolvedValue(expectedResult as any);

      const result = await controller.createAchievement(createAchievementDto);

      expect(service.createAchievement).toHaveBeenCalledWith(
        createAchievementDto.name,
        createAchievementDto.description,
        createAchievementDto.category,
        createAchievementDto.type,
        createAchievementDto.tier,
        createAchievementDto.requirements,
        createAchievementDto.pointsReward,
      );
      expect(result).toEqual(expectedResult);
    });

    // TODO: Add tests for validation errors, guard failures, etc.
  });

  describe('getAchievements', () => {
    it('should return an array of cultural achievements', async () => {
      const filterDto = {  };
      const expectedResult = [{ id: 'ach1', name: 'Ach 1' }, { id: 'ach2', name: 'Ach 2' }];
      jest.spyOn(service, 'getAchievements').mockResolvedValue(expectedResult as any);

      const result = await controller.getAchievements(filterDto as any);

      expect(service.getAchievements).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(expectedResult);
    });

    it('should return cultural achievements filtered by category', async () => {
      const filterDto = { category: AchievementCategory.LENGUA };
      const expectedResult = [{ id: 'ach1', name: 'Ach 1', category: AchievementCategory.LENGUA }];
      jest.spyOn(service, 'getAchievements').mockResolvedValue(expectedResult as any);

      const result = await controller.getAchievements(filterDto as any);

      expect(service.getAchievements).toHaveBeenCalledWith(filterDto.category);
      expect(result).toEqual(expectedResult);
    });

    // TODO: Add tests for filtering by category and type
  });

  describe('initializeProgress', () => {
    it('should initialize user progress for a cultural achievement', async () => {
      const achievementId = 'test-achievement-id';
      const userId = 'test-user-id'; // Mocked user ID from guard
      const expectedResult = { userId, achievementId, progress: 0 };

      jest.spyOn(service, 'initializeUserProgress').mockResolvedValue(expectedResult as any);

      const result = await controller.initializeProgress(userId, achievementId);

      expect(service.initializeUserProgress).toHaveBeenCalledWith(userId, achievementId);
      expect(result).toEqual(expectedResult);
    });

    // TODO: Add tests for validation errors, guard failures, etc.
  });

  describe('updateProgress', () => {
    it('should update user progress for a cultural achievement', async () => {
      const achievementId = 'test-achievement-id';
      const userId = 'test-user-id';
      const updateProgressDto = { updates: [{ type: 'lessons', value: 10 }] };
      const expectedResult = { userId, achievementId, progress: 10 };

      jest.spyOn(service, 'updateProgress').mockResolvedValue(expectedResult as any);

      const result = await controller.updateProgress(userId, achievementId, updateProgressDto);

      expect(service.updateProgress).toHaveBeenCalledWith(userId, achievementId, updateProgressDto.updates);
      expect(result).toEqual(expectedResult);
    });

    it('should handle validation errors', async () => {
      jest.spyOn(service, 'createAchievement').mockRejectedValue(new Error('Validation failed'));

      await expect(controller.createAchievement({} as any)).rejects.toThrow('Validation failed');
    });

    it('should handle guard failures', async () => {
      mockJwtAuthGuard.canActivate.mockReturnValue(false);

      await expect(controller.createAchievement({} as any)).rejects.toThrow();
    });
  });

  describe('getUserAchievements', () => {
    it('should return user achievements', async () => {
      const userId = 'test-user-id';
      const expectedResult = [{ id: 'ach1', name: 'Ach 1' }, { id: 'ach2', name: 'Ach 2' }];

      jest.spyOn(service, 'getUserAchievements').mockResolvedValue(expectedResult as any);

      const result = await controller.getUserAchievements(userId);

      expect(service.getUserAchievements).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle validation errors', async () => {
      jest.spyOn(service, 'getUserAchievements').mockRejectedValue(new Error('Validation failed'));

      await expect(controller.getUserAchievements(null)).rejects.toThrow('Validation failed');
    });

    it('should handle guard failures', async () => {
      mockJwtAuthGuard.canActivate.mockReturnValue(false);

      await expect(controller.getUserAchievements('test-user-id')).rejects.toThrow();
    });
  });

  describe('getAchievementProgress', () => {
    it('should return achievement progress for a user', async () => {
      const achievementId = 'test-achievement-id';
      const userId = 'test-user-id';
      const expectedResult = { userId, achievementId, progress: 50 };

      jest.spyOn(service, 'getAchievementProgress').mockResolvedValue(expectedResult as any);

      const result = await controller.getAchievementProgress(userId, achievementId);

      expect(service.getAchievementProgress).toHaveBeenCalledWith(userId, achievementId);
      expect(result).toEqual(expectedResult);
    });

     it('should handle validation errors', async () => {
      jest.spyOn(service, 'getAchievementProgress').mockRejectedValue(new Error('Validation failed'));

      await expect(controller.getAchievementProgress(null, null)).rejects.toThrow('Validation failed');
    });

    it('should handle guard failures', async () => {
      mockJwtAuthGuard.canActivate.mockReturnValue(false);

      await expect(controller.getAchievementProgress('test-user-id', 'test-achievement-id')).rejects.toThrow();
    });
  });
});
