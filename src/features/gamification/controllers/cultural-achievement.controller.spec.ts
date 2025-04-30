import { Test, TestingModule } from '@nestjs/testing';
import { CulturalAchievementController } from './cultural-achievement.controller';
import { CulturalAchievementService } from '../services/cultural-achievement.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { CreateAchievementDto, AchievementFilterDto, UpdateProgressDto, RequirementDto, ProgressUpdateDto } from '../dto/cultural-achievement.dto'; // Importar RequirementDto y ProgressUpdateDto
import { UserRole } from '../../../auth/entities/user.entity';
import { AchievementCategory, AchievementTier, AchievementType, CulturalAchievement } from '../entities/cultural-achievement.entity'; // Importar enums y CulturalAchievement
import { AchievementProgress } from '../entities/achievement-progress.entity'; // Importar AchievementProgress
import { NotFoundException } from '@nestjs/common';

describe('CulturalAchievementController', () => {
  let controller: CulturalAchievementController;
  let service: CulturalAchievementService;

  const mockCulturalAchievementService = {
    createAchievement: jest.fn(),
    getAchievements: jest.fn(),
    initializeUserProgress: jest.fn(),
    updateProgress: jest.fn(),
    getUserAchievements: jest.fn(),
    getAchievementProgress: jest.fn(),
  };

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
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<CulturalAchievementController>(CulturalAchievementController);
    service = module.get<CulturalAchievementService>(CulturalAchievementService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createAchievement', () => {
    it('should create a cultural achievement', async () => {
      const createAchievementDto: CreateAchievementDto = {
        name: 'Test Achievement',
        description: 'Test Description',
        category: AchievementCategory.LENGUA, // Usar enum
        type: AchievementType.CONTRIBUCION_CULTURAL, // Usar enum
        tier: AchievementTier.BRONCE, // Usar enum
        requirements: [{ type: 'test', value: 1, description: 'Test requirement' }], // Usar RequirementDto[]
        pointsReward: 100,
        additionalRewards: [], // Añadir propiedad opcional
        imageUrl: 'http://example.com/icon.png', // Añadir propiedad opcional
        isSecret: false, // Añadir propiedad opcional
      };
      const expectedAchievement: CulturalAchievement = {
        id: 'some-uuid',
        name: createAchievementDto.name,
        description: createAchievementDto.description,
        category: createAchievementDto.category,
        type: createAchievementDto.type,
        tier: createAchievementDto.tier,
        requirements: createAchievementDto.requirements,
        pointsReward: createAchievementDto.pointsReward,
        expirationDays: null, // Añadir propiedad de entidad
        additionalRewards: createAchievementDto.additionalRewards, // Añadir propiedad de entidad
        isActive: true, // Añadir propiedad de entidad
        isSecret: createAchievementDto.isSecret, // Añadir propiedad de entidad
        iconUrl: createAchievementDto.imageUrl, // Usar iconUrl en lugar de imageUrl
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCulturalAchievementService.createAchievement.mockResolvedValue(expectedAchievement);

      const result = await controller.createAchievement(createAchievementDto);

      expect(result).toEqual(expectedAchievement);
      // Corregir la aserción para que coincida con la llamada real en el controlador
      expect(mockCulturalAchievementService.createAchievement).toHaveBeenCalledWith(
        createAchievementDto.name,
        createAchievementDto.description,
        createAchievementDto.category,
        createAchievementDto.type,
        createAchievementDto.tier,
        createAchievementDto.requirements,
        createAchievementDto.pointsReward
      );
    });
  });

  describe('getAchievements', () => {
    it('should return an array of cultural achievements', async () => {
      const filterDto: AchievementFilterDto = { category: AchievementCategory.LENGUA }; // Usar enum
        const expectedAchievements: CulturalAchievement[] = [
          { id: 'ach1', name: 'Ach 1', description: 'Desc 1', category: AchievementCategory.LENGUA, type: AchievementType.CONTRIBUCION_CULTURAL, tier: AchievementTier.BRONCE, requirements: [], pointsReward: 10, expirationDays: null, additionalRewards: [], isActive: true, isSecret: false, iconUrl: 'icon1.png', createdAt: new Date(), updatedAt: new Date() }, // Usar enums y estructura de entidad, usar iconUrl
          { id: 'ach2', name: 'Ach 2', description: 'Desc 2', category: AchievementCategory.LENGUA, type: AchievementType.CONTRIBUCION_CULTURAL, tier: AchievementTier.PLATA, requirements: [], pointsReward: 50, expirationDays: null, additionalRewards: [], isActive: true, isSecret: false, iconUrl: 'icon2.png', createdAt: new Date(), updatedAt: new Date() }, // Usar enums y estructura de entidad, usar iconUrl
        ];

        mockCulturalAchievementService.getAchievements.mockResolvedValue(expectedAchievements);

      const result = await controller.getAchievements(filterDto);

      expect(result).toEqual(expectedAchievements);
      expect(mockCulturalAchievementService.getAchievements).toHaveBeenCalledWith(filterDto.category);
    });

    it('should return all cultural achievements if no filter is provided', async () => {
        const filterDto: AchievementFilterDto = {};
        const expectedAchievements: CulturalAchievement[] = [
          { id: 'ach1', name: 'Ach 1', description: 'Desc 1', category: AchievementCategory.LENGUA, type: AchievementType.CONTRIBUCION_CULTURAL, tier: AchievementTier.BRONCE, requirements: [], pointsReward: 10, expirationDays: null, additionalRewards: [], isActive: true, isSecret: false, iconUrl: 'icon1.png', createdAt: new Date(), updatedAt: new Date() }, // Usar enums y estructura de entidad, usar iconUrl
          { id: 'ach2', name: 'Ach 2', description: 'Desc 2', category: AchievementCategory.DANZA, type: AchievementType.PARTICIPACION_EVENTO, tier: AchievementTier.PLATA, requirements: [], pointsReward: 50, expirationDays: null, additionalRewards: [], isActive: true, isSecret: false, iconUrl: 'icon2.png', createdAt: new Date(), updatedAt: new Date() }, // Usar enums y estructura de entidad, usar iconUrl
        ];

        mockCulturalAchievementService.getAchievements.mockResolvedValue(expectedAchievements);

        const result = await controller.getAchievements(filterDto);

        expect(result).toEqual(expectedAchievements);
        expect(mockCulturalAchievementService.getAchievements).toHaveBeenCalledWith(undefined);
    });
  });

  describe('initializeProgress', () => {
    it('should initialize user progress for an achievement', async () => {
      const userId = 'test-user-id';
      const achievementId = 'test-achievement-id';
      const expectedProgress: AchievementProgress = {
        id: 'progress-uuid',
        user: null, // Usar relación
        achievement: null, // Usar relación
        progress: [], // Usar estructura de entidad
        percentageCompleted: 0, // Usar estructura de entidad
        isCompleted: false,
        completedAt: null,
        milestones: [], // Usar estructura de entidad
        rewardsCollected: [], // Usar estructura de entidad
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCulturalAchievementService.initializeUserProgress.mockResolvedValue(expectedProgress);

      const result = await controller.initializeProgress(userId, achievementId);

      expect(result).toEqual(expectedProgress);
      expect(mockCulturalAchievementService.initializeUserProgress).toHaveBeenCalledWith(userId, achievementId);
    });

    it('should throw NotFoundException if achievement or user not found', async () => {
        const userId = 'non-existent-user';
        const achievementId = 'non-existent-achievement';

        mockCulturalAchievementService.initializeUserProgress.mockRejectedValue(new NotFoundException());

        await expect(controller.initializeProgress(userId, achievementId)).rejects.toThrow(NotFoundException);
        expect(mockCulturalAchievementService.initializeUserProgress).toHaveBeenCalledWith(userId, achievementId);
    });
  });

  describe('updateProgress', () => {
    it('should update user progress for an achievement', async () => {
      const userId = 'test-user-id';
      const achievementId = 'test-achievement-id';
      const updateProgressDto: UpdateProgressDto = { updates: [{ type: 'test', value: 10 }] }; // Usar ProgressUpdateDto[]
      const expectedProgress: AchievementProgress = {
        id: 'progress-uuid',
        user: null, // Usar relación
        achievement: null, // Usar relación
        progress: [{ requirementType: 'test', currentValue: 10, targetValue: 20, lastUpdated: new Date() }], // Usar estructura de entidad
        percentageCompleted: 50, // Usar estructura de entidad
        isCompleted: false,
        completedAt: null,
        milestones: [], // Usar estructura de entidad
        rewardsCollected: [], // Usar estructura de entidad
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCulturalAchievementService.updateProgress.mockResolvedValue(expectedProgress);

      const result = await controller.updateProgress(userId, achievementId, updateProgressDto);

      expect(result).toEqual(expectedProgress);
      expect(mockCulturalAchievementService.updateProgress).toHaveBeenCalledWith(userId, achievementId, updateProgressDto.updates);
    });

    it('should throw NotFoundException if progress not found', async () => {
        const userId = 'test-user-id';
        const achievementId = 'non-existent-achievement';
        const updateProgressDto: UpdateProgressDto = { updates: [{ type: 'test', value: 10 }] }; // Corregir estructura del mock

        mockCulturalAchievementService.updateProgress.mockRejectedValue(new NotFoundException());

        await expect(controller.updateProgress(userId, achievementId, updateProgressDto)).rejects.toThrow(NotFoundException);
        expect(mockCulturalAchievementService.updateProgress).toHaveBeenCalledWith(userId, achievementId, updateProgressDto.updates);
    });
  });

  describe('getUserAchievements', () => {
    it('should return all cultural achievements for a user', async () => {
      const userId = 'test-user-id';
      const expectedAchievements: CulturalAchievement[] = [
        { id: 'ach1', name: 'Ach 1', description: 'Desc 1', category: AchievementCategory.LENGUA, type: AchievementType.CONTRIBUCION_CULTURAL, tier: AchievementTier.BRONCE, requirements: [], pointsReward: 10, expirationDays: null, additionalRewards: [], isActive: true, isSecret: false, iconUrl: 'icon1.png', createdAt: new Date(), updatedAt: new Date() }, // Usar enums y estructura de entidad, usar iconUrl
      ];

      mockCulturalAchievementService.getUserAchievements.mockResolvedValue(expectedAchievements);

      const result = await controller.getUserAchievements(userId);

      expect(result).toEqual(expectedAchievements);
      expect(mockCulturalAchievementService.getUserAchievements).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user not found', async () => {
        const userId = 'non-existent-user';

        mockCulturalAchievementService.getUserAchievements.mockRejectedValue(new NotFoundException());

        await expect(controller.getUserAchievements(userId)).rejects.toThrow(NotFoundException);
        expect(mockCulturalAchievementService.getUserAchievements).toHaveBeenCalledWith(userId);
    });
  });

  describe('getAchievementProgress', () => {
    it('should return the progress for a specific achievement for a user', async () => {
      const userId = 'test-user-id';
      const achievementId = 'test-achievement-id';
      const expectedProgress: AchievementProgress = {
        id: 'progress-uuid',
        user: null, // Usar relación
        achievement: null, // Usar relación
        progress: [], // Usar estructura de entidad
        percentageCompleted: 0, // Usar estructura de entidad
        isCompleted: false,
        completedAt: null,
        milestones: [], // Usar estructura de entidad
        rewardsCollected: [], // Usar estructura de entidad
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCulturalAchievementService.getAchievementProgress.mockResolvedValue(expectedProgress);

      const result = await controller.getAchievementProgress(userId, achievementId);

      expect(result).toEqual(expectedProgress);
      expect(mockCulturalAchievementService.getAchievementProgress).toHaveBeenCalledWith(userId, achievementId);
    });

    it('should throw NotFoundException if progress not found', async () => {
        const userId = 'test-user-id';
        const achievementId = 'non-existent-achievement';

        mockCulturalAchievementService.getAchievementProgress.mockRejectedValue(new NotFoundException());

        await expect(controller.getAchievementProgress(userId, achievementId)).rejects.toThrow(NotFoundException);
        expect(mockCulturalAchievementService.getAchievementProgress).toHaveBeenCalledWith(userId, achievementId);
    });
  });
});
