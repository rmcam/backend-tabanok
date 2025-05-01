import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamificationService } from '../gamification/services/gamification.service';
import { UserLevelRepository } from '../gamification/repositories/user-level.repository';
import { CreateStatisticsDto } from './dto/create-statistics.dto';
import { ReportType, TimeFrame } from './dto/statistics-report.dto';
import { Statistics } from './entities/statistics.entity';
import { StatisticsService } from './statistics.service';
import {
  CategoryDifficulty,
  CategoryStatus,
  CategoryType,
} from './types/category.enum';

// Define the mock class for UserLevelRepository
class MockUserLevelRepository {
  public repository = {
    findOne: jest.fn(),
    // Add other methods used by StatisticsService on userLevelRepository.repository if needed
  };
  // Add other methods used by StatisticsService directly on userLevelRepository instance if needed
}

// Define the mock class for GamificationService
class MockGamificationService {
  addPoints = jest.fn();
  // Add other methods used by StatisticsService on GamificationService if needed
}

describe('StatisticsService', () => {
  let service: StatisticsService;
  let repository: Repository<Statistics>;
  let gamificationService: GamificationService; // Inject the mocked service

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: getRepositoryToken(Statistics),
          useValue: mockRepository,
        },
        {
          provide: UserLevelRepository,
          useClass: MockUserLevelRepository, // Use the mock class here
        },
        {
          provide: GamificationService,
          useClass: MockGamificationService, // Use the mock class here
        },
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
    repository = module.get<Repository<Statistics>>(
      getRepositoryToken(Statistics),
    );
    gamificationService = module.get<GamificationService>(GamificationService); // Get the mocked service instance

    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create new statistics with initial values', async () => {
      const createDto: CreateStatisticsDto = {
        userId: 'test-user-id',
      };

      const expectedStats = {
        userId: createDto.userId,
        categoryMetrics: expect.any(Object),
        strengthAreas: [],
        improvementAreas: [],
        learningMetrics: {
          totalLessonsCompleted: 0,
          totalExercisesCompleted: 0,
          averageScore: 0,
          totalTimeSpentMinutes: 0,
          longestStreak: 0,
          currentStreak: 0,
          lastActivityDate: null,
          totalMasteryScore: 0,
        },
        weeklyProgress: [],
        monthlyProgress: [],
        achievementStats: expect.any(Object), // Added missing properties
        badgeStats: expect.any(Object), // Added missing properties
        learningPath: expect.any(Object), // Added missing properties
      };

      mockRepository.create.mockReturnValue(expectedStats);
      mockRepository.save.mockResolvedValue(expectedStats);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedStats);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: createDto.userId,
        }),
      );
      expect(mockRepository.save).toHaveBeenCalledWith(expectedStats);
    });
  });

  describe('updateLearningProgress', () => {
    it('should update learning progress correctly', async () => {
      const userId = 'test-user-id';
      const mockStatistics = {
        userId: userId, // Add userId property
        user: { id: userId } as any, // Add mock user property
        learningMetrics: {
          totalLessonsCompleted: 5,
          totalExercisesCompleted: 10,
          averageScore: 85,
          totalTimeSpentMinutes: 120,
        },
        categoryMetrics: {
          [CategoryType.VOCABULARY]: {
            type: CategoryType.VOCABULARY,
            difficulty: CategoryDifficulty.INTERMEDIATE,
            status: CategoryStatus.IN_PROGRESS,
            progress: {
              totalExercises: 15,
              completedExercises: 10,
              averageScore: 80,
              timeSpentMinutes: 120,
              lastPracticed: new Date().toISOString(),
              masteryLevel: 2,
              streak: 3,
            },
            prerequisites: [],
            unlockRequirements: {
              requiredScore: 0,
              requiredCategories: [],
            },
          },
          [CategoryType.GRAMMAR]: {
            type: CategoryType.GRAMMAR,
            difficulty: CategoryDifficulty.INTERMEDIATE,
            status: CategoryStatus.IN_PROGRESS,
            progress: {
              totalExercises: 0,
              completedExercises: 0,
              averageScore: 0,
              timeSpentMinutes: 0,
              lastPracticed: '',
              masteryLevel: 0,
              streak: 0,
            },
            prerequisites: [],
            unlockRequirements: {
              requiredScore: 0,
              requiredCategories: [],
            },
          },
          [CategoryType.PRONUNCIATION]: {
            type: CategoryType.PRONUNCIATION,
            difficulty: CategoryDifficulty.INTERMEDIATE,
            status: CategoryStatus.IN_PROGRESS,
            progress: {
              totalExercises: 0,
              completedExercises: 0,
              averageScore: 0,
              timeSpentMinutes: 0,
              lastPracticed: '',
              masteryLevel: 0,
              streak: 0,
            },
            prerequisites: [],
            unlockRequirements: {
              requiredScore: 0,
              requiredCategories: [],
            },
          },
          [CategoryType.COMPREHENSION]: {
            type: CategoryType.COMPREHENSION,
            difficulty: CategoryDifficulty.INTERMEDIATE,
            status: CategoryStatus.IN_PROGRESS,
            progress: {
              totalExercises: 0,
              completedExercises: 0,
              averageScore: 0,
              timeSpentMinutes: 0,
              lastPracticed: '',
              masteryLevel: 0,
              streak: 0,
            },
            prerequisites: [],
            unlockRequirements: {
              requiredScore: 0,
              requiredCategories: [],
            },
          },
          [CategoryType.WRITING]: {
            type: CategoryType.WRITING,
            difficulty: CategoryDifficulty.INTERMEDIATE,
            status: CategoryStatus.IN_PROGRESS,
            progress: {
              totalExercises: 0,
              completedExercises: 0,
              averageScore: 0,
              timeSpentMinutes: 0,
              lastPracticed: '',
              masteryLevel: 0,
              streak: 0,
            },
            prerequisites: [],
            unlockRequirements: {
              requiredScore: 0,
              requiredCategories: [],
            },
          },
          [CategoryType.SPEAKING]: {
            type: CategoryType.SPEAKING,
            difficulty: CategoryDifficulty.INTERMEDIATE,
            status: CategoryStatus.IN_PROGRESS,
            progress: {
              totalExercises: 0,
              completedExercises: 0,
              averageScore: 0,
              timeSpentMinutes: 0,
              lastPracticed: '',
              masteryLevel: 0,
              streak: 0,
            },
            prerequisites: [],
            unlockRequirements: {
              requiredScore: 0,
              requiredCategories: [],
            },
          },
        },
        learningPath: { // Add missing property
          customGoals: [],
        },
        weeklyProgress: [],
        monthlyProgress: [],
        achievementStats: { // Added missing properties
          totalAchievements: 0,
          achievementsByCategory: {},
          lastAchievementDate: '',
          specialAchievements: [],
        },
        badgeStats: { // Added missing properties
          totalBadges: 0,
          badgesByTier: {},
          lastBadgeDate: '',
          activeBadges: [],
        },
        periodicProgress: [], // Added missing properties
        createdAt: new Date().toISOString(), // Added missing properties
        updatedAt: new Date().toISOString(), // Added missing properties
      };

      mockRepository.findOne.mockResolvedValue(mockStatistics);
      mockRepository.save.mockImplementation((stats) => stats);
      jest.spyOn(gamificationService, 'addPoints').mockResolvedValue(undefined); // Mock gamificationService.addPoints

      const result = await service.updateLearningProgress(
        userId,
        true,
        true,
        90,
        30,
        CategoryType.VOCABULARY,
      );

      expect(result.learningMetrics.totalLessonsCompleted).toBe(6);
      expect(result.learningMetrics.totalExercisesCompleted).toBe(11);
      expect(result.learningMetrics.totalTimeSpentMinutes).toBe(150);
      expect(
        result.categoryMetrics[CategoryType.VOCABULARY].progress.totalExercises,
      ).toBe(16);
      expect(gamificationService.addPoints).toHaveBeenCalledWith(userId, 90); // Verify gamificationService.addPoints was called
    });

    it('should create new statistics if not found', async () => {
      const userId = 'new-user-id';
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockImplementation((dto) => ({
        ...dto,
        learningMetrics: {
          totalLessonsCompleted: 0,
          totalExercisesCompleted: 0,
          averageScore: 0,
          totalTimeSpentMinutes: 0,
        },
        categoryMetrics: {},
        weeklyProgress: [],
        monthlyProgress: [],
        achievementStats: { // Added missing properties
          totalAchievements: 0,
          achievementsByCategory: {},
          lastAchievementDate: '',
          specialAchievements: [],
        },
        badgeStats: { // Added missing properties
          totalBadges: 0,
          badgesByTier: {},
          lastBadgeDate: '',
          activeBadges: [],
        },
        learningPath: { // Added missing properties
          customGoals: [],
        },
        periodicProgress: [], // Added missing properties
        createdAt: new Date().toISOString(), // Added missing properties
        updatedAt: new Date().toISOString(), // Added missing properties
      }));
      mockRepository.save.mockImplementation((stats) => stats);
      jest.spyOn(gamificationService, 'addPoints').mockResolvedValue(undefined); // Mock gamificationService.addPoints


      const result = await service.updateLearningProgress(
        userId,
        true,
        false,
        85,
        20,
        CategoryType.VOCABULARY,
      );

      expect(result.learningMetrics.totalLessonsCompleted).toBe(1);
      expect(result.learningMetrics.totalExercisesCompleted).toBe(0);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(gamificationService.addPoints).toHaveBeenCalledWith(userId, 85); // Verify gamificationService.addPoints was called
    });
  });

  describe('generateReport', () => {
    it('should generate learning progress report', async () => {
      const mockStatistics = {
        userId: 'test-user-id',
        learningMetrics: {
          totalLessonsCompleted: 20,
          totalExercisesCompleted: 40,
          averageScore: 85,
        },
        categoryMetrics: {},
        weeklyProgress: [],
        monthlyProgress: [],
        achievementStats: { // Added missing properties
          totalAchievements: 0,
          achievementsByCategory: {},
          lastAchievementDate: '',
          specialAchievements: [],
        },
        badgeStats: { // Added missing properties
          totalBadges: 0,
          badgesByTier: {},
          lastBadgeDate: '',
          activeBadges: [],
        },
        learningPath: { // Added missing properties
          currentLevel: 1,
          recommendedCategories: [],
          nextMilestones: [],
          customGoals: [],
        },
        periodicProgress: [], // Added missing properties
        createdAt: new Date().toISOString(), // Added missing properties
        updatedAt: new Date().toISOString(), // Added missing properties
      };

      mockRepository.findOne.mockResolvedValue(mockStatistics);

      // Mock the report generator methods used by generateReport
      jest.spyOn(service as any, 'getDateRange').mockReturnValue({ start: new Date(), end: new Date() });
      jest.spyOn(service as any, 'filterProgressByDate').mockReturnValue([]);
      jest.spyOn(service as any, 'filterCategoriesProgress').mockReturnValue({});
      jest.spyOn(service as any, 'generateLearningProgressReport').mockResolvedValue({ summary: {}, categoryProgress: {}, timeline: [] });
      jest.spyOn(service as any, 'generateAchievementsReport').mockResolvedValue({});
      jest.spyOn(service as any, 'generatePerformanceReport').mockResolvedValue({});
      jest.spyOn(service as any, 'generateComprehensiveReport').mockResolvedValue({});


      const result = await service.generateReport({
        userId: 'test-user-id',
        reportType: ReportType.LEARNING_PROGRESS,
        timeFrame: TimeFrame.WEEKLY,
      });

      expect(result).toHaveProperty('userId', 'test-user-id');
      expect(result).toHaveProperty('reportType', ReportType.LEARNING_PROGRESS);
      expect(result).toHaveProperty('timeFrame', TimeFrame.WEEKLY);
      expect(result).toHaveProperty('data');
      expect(result.data).toHaveProperty('summary');
    });
  });

  describe('calculateConsistencyScore', () => {
    it('should calculate consistency metrics correctly', () => {
      const progress = [
        {
          date: '2024-03-25',
          lessonsCompleted: 2,
          exercisesCompleted: 3,
          averageScore: 85,
          timeSpentMinutes: 45,
          dailyGoalsAchieved: 2,
          dailyGoalsTotal: 3,
          focusScore: 75,
          consistencyMetrics: {
            daysActive: 1,
            totalSessions: 1,
            averageSessionDuration: 45,
            preferredTimeOfDay: 'afternoon',
            regularityScore: 85,
            dailyStreak: 3,
            weeklyCompletion: 80,
            timeDistribution: {
              morning: 0,
              afternoon: 45,
              evening: 0,
              night: 0,
            },
          },
          month: '2024-03',
          monthlyGoalsAchieved: 2,
          monthlyGoalsTotal: 5,
          improvementRate: 0,
        },
        {
          date: '2024-03-26',
          lessonsCompleted: 3,
          exercisesCompleted: 4,
          averageScore: 90,
          timeSpentMinutes: 60,
          dailyGoalsAchieved: 3,
          dailyGoalsTotal: 3,
          focusScore: 80,
          month: '2024-03',
          monthlyGoalsAchieved: 3,
          monthlyGoalsTotal: 5,
          improvementRate: 0,
          consistencyMetrics: {
            daysActive: 1,
            totalSessions: 1,
            averageSessionDuration: 60,
            preferredTimeOfDay: 'afternoon',
            regularityScore: 90,
            dailyStreak: 4,
            weeklyCompletion: 85,
            timeDistribution: {
              morning: 0,
              afternoon: 60,
              evening: 0,
              night: 0,
            },
          },
        },
      ];

      const mockStats: Statistics = {
        id: 'test-id',
        userId: 'test-user',
        user: { id: 'test-user' } as any, // Add mock user property
        categoryMetrics: {
          [CategoryType.VOCABULARY]: {
            type: CategoryType.VOCABULARY,
            difficulty: CategoryDifficulty.INTERMEDIATE,
            status: CategoryStatus.IN_PROGRESS,
            progress: {
              totalExercises: 0,
              completedExercises: 0,
              averageScore: 0,
              timeSpentMinutes: 0,
              lastPracticed: '',
              masteryLevel: 0,
              streak: 0,
            },
            prerequisites: [],
            unlockRequirements: {
              requiredScore: 0,
              requiredCategories: [],
            },
          },
          [CategoryType.GRAMMAR]: {
            type: CategoryType.GRAMMAR,
            difficulty: CategoryDifficulty.INTERMEDIATE,
            status: CategoryStatus.IN_PROGRESS,
            progress: {
              totalExercises: 0,
              completedExercises: 0,
              averageScore: 0,
              timeSpentMinutes: 0,
              lastPracticed: '',
              masteryLevel: 0,
              streak: 0,
            },
            prerequisites: [],
            unlockRequirements: {
              requiredScore: 0,
              requiredCategories: [],
            },
          },
          [CategoryType.PRONUNCIATION]: {
            type: CategoryType.PRONUNCIATION,
            difficulty: CategoryDifficulty.INTERMEDIATE,
            status: CategoryStatus.IN_PROGRESS,
            progress: {
              totalExercises: 0,
              completedExercises: 0,
              averageScore: 0,
              timeSpentMinutes: 0,
              lastPracticed: '',
              masteryLevel: 0,
              streak: 0,
            },
            prerequisites: [],
            unlockRequirements: {
              requiredScore: 0,
              requiredCategories: [],
            },
          },
          [CategoryType.COMPREHENSION]: {
            type: CategoryType.COMPREHENSION,
            difficulty: CategoryDifficulty.INTERMEDIATE,
            status: CategoryStatus.IN_PROGRESS,
            progress: {
              totalExercises: 0,
              completedExercises: 0,
              averageScore: 0,
              timeSpentMinutes: 0,
              lastPracticed: '',
              masteryLevel: 0,
              streak: 0,
            },
            prerequisites: [],
            unlockRequirements: {
              requiredScore: 0,
              requiredCategories: [],
            },
          },
          [CategoryType.WRITING]: {
            type: CategoryType.WRITING,
            difficulty: CategoryDifficulty.INTERMEDIATE,
            status: CategoryStatus.IN_PROGRESS,
            progress: {
              totalExercises: 0,
              completedExercises: 0,
              averageScore: 0,
              timeSpentMinutes: 0,
              lastPracticed: '',
              masteryLevel: 0,
              streak: 0,
            },
            prerequisites: [],
            unlockRequirements: {
              requiredScore: 0,
              requiredCategories: [],
            },
          },
          [CategoryType.SPEAKING]: {
            type: CategoryType.SPEAKING,
            difficulty: CategoryDifficulty.INTERMEDIATE,
            status: CategoryStatus.IN_PROGRESS,
            progress: {
              totalExercises: 0,
              completedExercises: 0,
              averageScore: 0,
              timeSpentMinutes: 0,
              lastPracticed: '',
              masteryLevel: 0,
              streak: 0,
            },
            prerequisites: [],
            unlockRequirements: {
              requiredScore: 0,
              requiredCategories: [],
            },
          },
        },
        strengthAreas: [],
        improvementAreas: [],
        learningMetrics: {
          totalLessonsCompleted: 0,
          totalExercisesCompleted: 0,
          averageScore: 0,
          totalTimeSpentMinutes: 0,
          longestStreak: 0,
          currentStreak: 0,
          lastActivityDate: null,
          totalMasteryScore: 0,
        },
        weeklyProgress: [],
        monthlyProgress: progress.map(p => ({
          ...p,
          monthStartDate: new Date(p.date).toISOString(),
          consistencyMetrics: {
            daysActive: 1,
            totalSessions: 1,
            averageSessionDuration: p.timeSpentMinutes,
            preferredTimeOfDay: 'afternoon',
            regularityScore: 85,
            dailyStreak: 1,
            weeklyCompletion: 100,
            timeDistribution: {
              morning: 0,
              afternoon: p.timeSpentMinutes,
              evening: 0,
              night: 0,
            },
          },
        })),
        achievementStats: {
          totalAchievements: 0,
          achievementsByCategory: {},
          lastAchievementDate: '',
          specialAchievements: [],
        },
        badgeStats: {
          totalBadges: 0,
          badgesByTier: {},
          lastBadgeDate: '',
          activeBadges: [],
        },
        learningPath: {
          currentLevel: 1,
          recommendedCategories: [],
          nextMilestones: [],
          customGoals: [],
        },
        periodicProgress: progress.map(p => ({
          date: p.date,
          lessonsCompleted: p.lessonsCompleted,
          exercisesCompleted: p.exercisesCompleted,
          averageScore: p.averageScore,
          timeSpentMinutes: p.timeSpentMinutes,
          dailyGoalsAchieved: p.dailyGoalsAchieved,
          dailyGoalsTotal: p.dailyGoalsTotal,
          focusScore: p.focusScore,
          consistencyMetrics: p.consistencyMetrics,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = service['calculateConsistencyScore'](mockStats.periodicProgress);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateTimeDistribution', () => {
    it('should calculate time distribution for a single day', () => {
      const date = new Date('2024-03-26T14:30:00'); // 2:30 PM
      const timeSpentMinutes = 60;

      const result = service['calculateTimeDistribution'](
        date,
        timeSpentMinutes,
      );

      expect(result).toEqual({
        morning: 0,
        afternoon: 1,
        evening: 0,
        night: 0,
      });
    });

    it('should calculate time distribution for multiple days', () => {
      const timeData = [
        { minutes: 60, date: new Date('2024-03-26T10:00:00').toISOString() }, // Morning
        { minutes: 45, date: new Date('2024-03-26T15:00:00').toISOString() }, // Afternoon
        { minutes: 30, date: new Date('2024-03-26T20:00:00').toISOString() }, // Evening
      ];

      const result = service['calculateTimeDistribution'](
        timeData, // Pass the array
        0 // The second argument is not used for array input, pass a dummy value
      );

      // Expected result: total minutes per hour across all entries
      expect(result).toEqual({
        10: 60,
        15: 45,
        20: 30,
      });
    });
  });

  describe('calculateImprovementRate', () => {
    it('should calculate improvement rate between months', () => {
      const mockStatistics: Statistics = {
        id: 'test-id',
        userId: 'test-user',
        user: { id: 'test-user' } as any, // Add mock user property
        periodicProgress: [],
        achievementStats: {
          totalAchievements: 0,
          achievementsByCategory: {},
          lastAchievementDate: '',
          specialAchievements: [],
        },
        badgeStats: {
          totalBadges: 0,
          badgesByTier: {},
          lastBadgeDate: '',
          activeBadges: [],
        },
        learningPath: {
          currentLevel: 1,
          recommendedCategories: [],
          nextMilestones: [],
          customGoals: [],
        },
        categoryMetrics: {
          [CategoryType.VOCABULARY]: {
            type: CategoryType.VOCABULARY,
            difficulty: CategoryDifficulty.INTERMEDIATE,
            status: CategoryStatus.IN_PROGRESS,
            progress: {
              totalExercises: 15,
              completedExercises: 10,
              averageScore: 80,
              timeSpentMinutes: 120,
              lastPracticed: new Date().toISOString(),
              masteryLevel: 2,
              streak: 3,
            },
            prerequisites: [],
            unlockRequirements: {
              requiredScore: 0,
              requiredCategories: [],
            },
          },
          [CategoryType.GRAMMAR]: {
            type: CategoryType.GRAMMAR,
            difficulty: CategoryDifficulty.INTERMEDIATE,
            status: CategoryStatus.IN_PROGRESS,
            progress: {
              totalExercises: 0,
              completedExercises: 0,
              averageScore: 0,
              timeSpentMinutes: 0,
              lastPracticed: '',
              masteryLevel: 0,
              streak: 0,
            },
            prerequisites: [],
            unlockRequirements: {
              requiredScore: 0,
              requiredCategories: [],
            },
          },
          [CategoryType.PRONUNCIATION]: {
            type: CategoryType.PRONUNCIATION,
            difficulty: CategoryDifficulty.INTERMEDIATE,
            status: CategoryStatus.IN_PROGRESS,
            progress: {
              totalExercises: 0,
              completedExercises: 0,
              averageScore: 0,
              timeSpentMinutes: 0,
              lastPracticed: '',
              masteryLevel: 0,
              streak: 0,
            },
            prerequisites: [],
            unlockRequirements: {
              requiredScore: 0,
              requiredCategories: [],
            },
          },
          [CategoryType.COMPREHENSION]: {
            type: CategoryType.COMPREHENSION,
            difficulty: CategoryDifficulty.INTERMEDIATE,
            status: CategoryStatus.IN_PROGRESS,
            progress: {
              totalExercises: 0,
              completedExercises: 0,
              averageScore: 0,
              timeSpentMinutes: 0,
              lastPracticed: '',
              masteryLevel: 0,
              streak: 0,
            },
            prerequisites: [],
            unlockRequirements: {
              requiredScore: 0,
              requiredCategories: [],
            },
          },
          [CategoryType.WRITING]: {
            type: CategoryType.WRITING,
            difficulty: CategoryDifficulty.INTERMEDIATE,
            status: CategoryStatus.IN_PROGRESS,
            progress: {
              totalExercises: 0,
              completedExercises: 0,
              averageScore: 0,
              timeSpentMinutes: 0,
              lastPracticed: '',
              masteryLevel: 0,
              streak: 0,
            },
            prerequisites: [],
            unlockRequirements: {
              requiredScore: 0,
              requiredCategories: [],
            },
          },
          [CategoryType.SPEAKING]: {
            type: CategoryType.SPEAKING,
            difficulty: CategoryDifficulty.INTERMEDIATE,
            status: CategoryStatus.IN_PROGRESS,
            progress: {
              totalExercises: 0,
              completedExercises: 0,
              averageScore: 0,
              timeSpentMinutes: 0,
              lastPracticed: '',
              masteryLevel: 0,
              streak: 0,
            },
            prerequisites: [],
            unlockRequirements: {
              requiredScore: 0,
              requiredCategories: [],
            },
          },
        },
        strengthAreas: [],
        improvementAreas: [],
        learningMetrics: {
          totalLessonsCompleted: 0,
          totalExercisesCompleted: 0,
          averageScore: 0,
          totalTimeSpentMinutes: 0,
          longestStreak: 0,
          currentStreak: 0,
          lastActivityDate: null,
          totalMasteryScore: 0,
        },
        weeklyProgress: [],
        monthlyProgress: [
          {
            monthStartDate: new Date('2024-02-01').toISOString(),
            month: '2024-02',
            lessonsCompleted: 10,
            exercisesCompleted: 20,
            averageScore: 80,
            monthlyGoalsAchieved: 0,
            monthlyGoalsTotal: 0,
            improvementRate: 0,
            timeSpentMinutes: 0,
            consistencyMetrics: {
              daysActive: 0,
              totalSessions: 0,
              averageSessionDuration: 0,
              preferredTimeOfDay: '',
              regularityScore: 0,
              dailyStreak: 0,
              weeklyCompletion: 0,
              timeDistribution: {
                morning: 0,
                afternoon: 0,
                evening: 0,
                night: 0,
              },
            },
          },
          {
            monthStartDate: new Date('2024-03-01').toISOString(),
            month: '2024-03',
            lessonsCompleted: 15,
            exercisesCompleted: 25,
            averageScore: 85,
            monthlyGoalsAchieved: 0,
            monthlyGoalsTotal: 0,
            improvementRate: 0,
            timeSpentMinutes: 0,
            consistencyMetrics: {
              daysActive: 0,
              totalSessions: 0,
              averageSessionDuration: 0,
              preferredTimeOfDay: '',
              regularityScore: 0,
              dailyStreak: 0,
              weeklyCompletion: 0,
              timeDistribution: {
                morning: 0,
                afternoon: 0,
                evening: 0,
                night: 0,
              },
            },
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const currentMonth = mockStatistics.monthlyProgress[1];
      const previousMonth = mockStatistics.monthlyProgress[0];

      const result = service['calculateImprovementRate'](
        mockStatistics,
        mockStatistics.monthlyProgress[1]
      );

      expect(result).toBeGreaterThan(0);
    });
  });
});
