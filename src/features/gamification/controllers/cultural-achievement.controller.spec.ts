import { Test, TestingModule } from '@nestjs/testing';
import { CulturalAchievementController } from './cultural-achievement.controller';
import { CulturalAchievementService } from '../services/cultural-achievement.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { CreateAchievementDto, UpdateProgressDto, AchievementFilterDto } from '../dto/cultural-achievement.dto';
import { AchievementCategory, AchievementTier } from '../entities/cultural-achievement.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../../auth/entities/user.entity';

// Mock service
const mockCulturalAchievementService = {
  createAchievement: jest.fn(),
  getAchievements: jest.fn(),
  initializeUserProgress: jest.fn(),
  updateProgress: jest.fn(),
  getUserAchievements: jest.fn(),
  getAchievementProgress: jest.fn(),
};

describe('CulturalAchievementController', () => {
  let controller: CulturalAchievementController;
  let service: CulturalAchievementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CulturalAchievementController],
      providers: [
        { provide: CulturalAchievementService, useValue: mockCulturalAchievementService },
      ],
    })
    // Mock guards
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true }) // Assume authorized for basic tests
    .compile();

    controller = module.get<CulturalAchievementController>(CulturalAchievementController);
    service = module.get<CulturalAchievementService>(CulturalAchievementService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // --- Test createAchievement ---
  describe('createAchievement', () => {
    it('should create an achievement and return it', async () => {
      const createDto: CreateAchievementDto = {
        name: 'Test Achievement',
        description: 'Test Desc',
        category: AchievementCategory.LENGUA,
        tier: AchievementTier.BRONCE,
        requirements: [{ type: 'lesson', value: 1, description: 'Complete lesson 1' }],
        pointsReward: 10,
        imageUrl: 'icon.png'
      };
      const expectedResult = { id: 'uuid-1', ...createDto, isActive: true, isSecret: false, points: 0, createdAt: new Date(), updatedAt: new Date() };
      mockCulturalAchievementService.createAchievement.mockResolvedValue(expectedResult);

      const result = await controller.createAchievement(createDto);

      expect(result).toEqual(expectedResult);
      expect(service.createAchievement).toHaveBeenCalledWith(createDto);
    });

    // Add test for ForbiddenException if RolesGuard mock is more sophisticated
  });

  // --- Test getAchievements ---
  describe('getAchievements', () => {
    it('should return a list of achievements', async () => {
      const filter: AchievementFilterDto = {};
      const expectedResult = [{ id: 'uuid-1', name: 'Ach 1' }, { id: 'uuid-2', name: 'Ach 2' }];
      mockCulturalAchievementService.getAchievements.mockResolvedValue(expectedResult);

      const result = await controller.getAchievements(filter);

      expect(result).toEqual(expectedResult);
      expect(service.getAchievements).toHaveBeenCalledWith(undefined);
    });

     it('should return a filtered list of achievements by category', async () => {
      const filter: AchievementFilterDto = { category: AchievementCategory.DANZA };
      const expectedResult = [{ id: 'uuid-1', name: 'Danza Ach 1', category: AchievementCategory.DANZA }];
      mockCulturalAchievementService.getAchievements.mockResolvedValue(expectedResult);

      const result = await controller.getAchievements(filter);

      expect(result).toEqual(expectedResult);
      expect(service.getAchievements).toHaveBeenCalledWith(AchievementCategory.DANZA);
    });
  });

  // --- Test initializeProgress ---
  describe('initializeProgress', () => {
    it('should initialize progress for a user and achievement', async () => {
      const userId = 'user-uuid';
      const achievementId = 'ach-uuid';
      const expectedResult = { userId, achievementId, progress: 0 }; // Example
      mockCulturalAchievementService.initializeUserProgress.mockResolvedValue(expectedResult);

      const result = await controller.initializeProgress(userId, achievementId);

      expect(result).toEqual(expectedResult);
      expect(service.initializeUserProgress).toHaveBeenCalledWith(userId, achievementId);
    });

    it('should throw NotFoundException if user or achievement not found', async () => {
      const userId = 'invalid-user';
      const achievementId = 'invalid-ach';
      mockCulturalAchievementService.initializeUserProgress.mockRejectedValue(new NotFoundException());

      await expect(controller.initializeProgress(userId, achievementId)).rejects.toThrow(NotFoundException);
      expect(service.initializeUserProgress).toHaveBeenCalledWith(userId, achievementId);
    });
  });

  // --- Test updateProgress ---
  describe('updateProgress', () => {
    it('should update progress and return the result', async () => {
      const userId = 'user-uuid';
      const achievementId = 'ach-uuid';
      const updateDto: UpdateProgressDto = { updates: [{ type: 'current', value: 50 }] };
      const expectedResult = { userId, achievementId, progress: 50 }; // Example
      mockCulturalAchievementService.updateProgress.mockResolvedValue(expectedResult);

      const result = await controller.updateProgress(userId, achievementId, updateDto);

      expect(result).toEqual(expectedResult);
      expect(service.updateProgress).toHaveBeenCalledWith(userId, achievementId, updateDto.updates);
    });

    it('should throw NotFoundException if progress record not found', async () => {
      const userId = 'invalid-user';
      const achievementId = 'invalid-ach';
      const updateDto: UpdateProgressDto = { updates: [{ type: 'current', value: 50 }] };
      mockCulturalAchievementService.updateProgress.mockRejectedValue(new NotFoundException());

      await expect(controller.updateProgress(userId, achievementId, updateDto)).rejects.toThrow(NotFoundException);
      expect(service.updateProgress).toHaveBeenCalledWith(userId, achievementId, updateDto.updates);
    });
  });

  // --- Test getUserAchievements ---
  describe('getUserAchievements', () => {
    it('should return achievements for a user', async () => {
      const userId = 'user-uuid';
      const expectedResult = [{ id: 'ach-uuid-1' }, { id: 'ach-uuid-2' }]; // Example
      mockCulturalAchievementService.getUserAchievements.mockResolvedValue(expectedResult);

      const result = await controller.getUserAchievements(userId);

      expect(result).toEqual(expectedResult);
      expect(service.getUserAchievements).toHaveBeenCalledWith(userId);
    });

     it('should throw NotFoundException if user not found', async () => {
      const userId = 'invalid-user';
      mockCulturalAchievementService.getUserAchievements.mockRejectedValue(new NotFoundException());

      await expect(controller.getUserAchievements(userId)).rejects.toThrow(NotFoundException);
      expect(service.getUserAchievements).toHaveBeenCalledWith(userId);
    });
  });

  // --- Test getAchievementProgress ---
  describe('getAchievementProgress', () => {
    it('should return specific progress for a user and achievement', async () => {
      const userId = 'user-uuid';
      const achievementId = 'ach-uuid';
      const expectedResult = { userId, achievementId, progress: 75 }; // Example
      mockCulturalAchievementService.getAchievementProgress.mockResolvedValue(expectedResult);

      const result = await controller.getAchievementProgress(userId, achievementId);

      expect(result).toEqual(expectedResult);
      expect(service.getAchievementProgress).toHaveBeenCalledWith(userId, achievementId);
    });

     it('should throw NotFoundException if progress record not found', async () => {
      const userId = 'invalid-user';
      const achievementId = 'invalid-ach';
      mockCulturalAchievementService.getAchievementProgress.mockRejectedValue(new NotFoundException());

      await expect(controller.getAchievementProgress(userId, achievementId)).rejects.toThrow(NotFoundException);
      expect(service.getAchievementProgress).toHaveBeenCalledWith(userId, achievementId);
    });
  });

});
