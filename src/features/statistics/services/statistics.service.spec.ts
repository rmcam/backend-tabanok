import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatisticsService } from './statistics.service';
import { GamificationService } from '../../gamification/services/gamification.service';
import { StatisticsReportService } from './statistics-report.service';
import { Statistics } from '../entities/statistics.entity';
import { NotFoundException } from '@nestjs/common';
import { User } from '@/auth/entities/user.entity'; // Importar User entity
import { CategoryType, CategoryDifficulty, CategoryStatus, GoalType, FrequencyType } from '../types/category.enum'; // Importar enums

// Mock del StatisticsRepository
const mockStatisticsRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
};

// Mock del GamificationService
const mockGamificationService = {
  // Añadir mocks para los métodos de GamificationService utilizados en StatisticsService si es necesario
};

// Mock del StatisticsReportService
const mockStatisticsReportService = {
  generateReport: jest.fn(),
};

// Mock completo de la entidad Statistics
const createMockStatistics = (partialStats: Partial<Statistics> = {}): Statistics => ({
  id: partialStats.id || 'mock-stat-id',
  userId: partialStats.userId || 'mock-user-id',
  user: partialStats.user || {} as User, // Mock User entity
  categoryMetrics: partialStats.categoryMetrics || {} as Record<CategoryType, any>, // Mock categoryMetrics
  strengthAreas: partialStats.strengthAreas || [], // Mock strengthAreas
  improvementAreas: partialStats.improvementAreas || [], // Mock improvementAreas
  learningMetrics: partialStats.learningMetrics || { // Mock learningMetrics
    totalLessonsCompleted: 0,
    totalExercisesCompleted: 0,
    averageScore: 0,
    totalTimeSpentMinutes: 0,
    longestStreak: 0,
    currentStreak: 0,
    lastActivityDate: null,
    totalMasteryScore: 0,
  },
  weeklyProgress: partialStats.weeklyProgress || [], // Mock weeklyProgress
  monthlyProgress: partialStats.monthlyProgress || [], // Mock monthlyProgress
  periodicProgress: partialStats.periodicProgress || [], // Mock periodicProgress
  achievementStats: partialStats.achievementStats || { // Mock achievementStats
    totalAchievements: 0,
    achievementsByCategory: {},
    lastAchievementDate: '',
    specialAchievements: [],
  },
  badgeStats: partialStats.badgeStats || { // Mock badgeStats
    totalBadges: 0,
    badgesByTier: {},
    lastBadgeDate: '',
    activeBadges: [],
  },
  learningPath: partialStats.learningPath || { // Mock learningPath
    currentLevel: 0,
    recommendedCategories: [],
    nextMilestones: [],
    customGoals: [],
  },
  createdAt: partialStats.createdAt || new Date().toISOString(), // Mock createdAt
  updatedAt: partialStats.updatedAt || new Date().toISOString(), // Mock updatedAt
  ...partialStats, // Sobrescribir con propiedades parciales proporcionadas
});


describe('StatisticsService', () => {
  let service: StatisticsService;
  let statisticsRepository: Repository<Statistics>;
  let gamificationService: GamificationService;
  let reportService: StatisticsReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: getRepositoryToken(Statistics),
          useValue: mockStatisticsRepository,
        },
        {
          provide: GamificationService,
          useValue: mockGamificationService,
        },
        {
          provide: StatisticsReportService,
          useValue: mockStatisticsReportService,
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    statisticsRepository = module.get<Repository<Statistics>>(getRepositoryToken(Statistics));
    gamificationService = module.get<GamificationService>(GamificationService);
    reportService = module.get<StatisticsReportService>(StatisticsReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a new statistics entry', async () => {
      const createStatisticsDto = { userId: 'user1', totalPoints: 100 };
      const expectedStatistics = createMockStatistics({ userId: 'user1', learningMetrics: { totalPoints: 100 } as any }); // Usar mock completo

      mockStatisticsRepository.create.mockReturnValue(expectedStatistics);
      mockStatisticsRepository.save.mockResolvedValue(expectedStatistics);

      const result = await service.create(createStatisticsDto as any);

      expect(mockStatisticsRepository.create).toHaveBeenCalledWith(createStatisticsDto);
      expect(mockStatisticsRepository.save).toHaveBeenCalledWith(expectedStatistics);
      expect(result).toEqual(expectedStatistics);
    });
  });

  describe('findAll', () => {
    it('should return an array of statistics', async () => {
      const expectedStatistics: Statistics[] = [createMockStatistics({ userId: 'user1' })]; // Usar mock completo
      mockStatisticsRepository.find.mockResolvedValue(expectedStatistics);

      const result = await service.findAll();

      expect(mockStatisticsRepository.find).toHaveBeenCalled();
      expect(result).toEqual(expectedStatistics);
    });
  });

  describe('findOne', () => {
    it('should return a statistics entry if found', async () => {
      const statisticsId = 'stat1';
      const expectedStatistics: Statistics = createMockStatistics({ id: statisticsId, userId: 'user1' }); // Usar mock completo
      mockStatisticsRepository.findOne.mockResolvedValue(expectedStatistics);

      const result = await service.findOne(statisticsId);

      expect(mockStatisticsRepository.findOne).toHaveBeenCalledWith({ where: { id: statisticsId } });
      expect(result).toEqual(expectedStatistics);
    });

    it('should throw NotFoundException if statistics entry is not found', async () => {
      const statisticsId = 'non-existent-id';
      mockStatisticsRepository.findOne.mockResolvedValue(undefined);

      await expect(service.findOne(statisticsId)).rejects.toThrow(NotFoundException);
      expect(mockStatisticsRepository.findOne).toHaveBeenCalledWith({ where: { id: statisticsId } });
    });
  });

  describe('findByUserId', () => {
    it('should return a statistics entry if found by user ID', async () => {
      const userId = 'user1';
      const expectedStatistics: Statistics = createMockStatistics({ userId: userId }); // Usar mock completo
      mockStatisticsRepository.findOne.mockResolvedValue(expectedStatistics);

      const result = await service.findByUserId(userId);

      expect(mockStatisticsRepository.findOne).toHaveBeenCalledWith({ where: { userId: userId } });
      expect(result).toEqual(expectedStatistics);
    });

    it('should throw NotFoundException if statistics entry is not found for user ID', async () => {
      const userId = 'non-existent-user';
      mockStatisticsRepository.findOne.mockResolvedValue(undefined);

      await expect(service.findByUserId(userId)).rejects.toThrow(NotFoundException);
      expect(mockStatisticsRepository.findOne).toHaveBeenCalledWith({ where: { userId: userId } });
    });
  });

  describe('generateReport', () => {
    it('should generate a report by user ID', async () => {
      const generateReportDto = { userId: 'user1', reportType: 'summary' };
      const mockStatistics: Statistics = createMockStatistics({ userId: 'user1' }); // Usar mock completo
      const expectedReport = { summary: 'Report data' };

      jest.spyOn(service, 'findByUserId').mockResolvedValue(mockStatistics);
      mockStatisticsReportService.generateReport.mockResolvedValue(expectedReport);

      const result = await service.generateReport(generateReportDto as any);

      expect(service.findByUserId).toHaveBeenCalledWith(generateReportDto.userId);
      expect(mockStatisticsReportService.generateReport).toHaveBeenCalledWith(mockStatistics, generateReportDto);
      expect(result).toEqual(expectedReport);
    });

    it('should throw NotFoundException if user statistics are not found for report generation', async () => {
      const generateReportDto = { userId: 'non-existent-user', reportType: 'summary' };

      // Reset the mock before setting the new behavior
      mockStatisticsReportService.generateReport.mockReset();
      jest.spyOn(service, 'findByUserId').mockRejectedValue(new NotFoundException(`Statistics for user ${generateReportDto.userId} not found`));

      await expect(service.generateReport(generateReportDto as any)).rejects.toThrow(NotFoundException);
      expect(service.findByUserId).toHaveBeenCalledWith(generateReportDto.userId);
      expect(mockStatisticsReportService.generateReport).not.toHaveBeenCalled();
    });
  });
});

type MockType<T> = {
  [P in keyof T]?: jest.Mock<any, any>;
};
