import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamificationService } from '../gamification/gamification.service';
import { CreateStatisticsDto } from './dto/create-statistics.dto';
import { ReportType, TimeFrame } from './dto/statistics-report.dto';
import { Statistics } from './entities/statistics.entity';
import { CategoryType } from './interfaces/category.interface';
import { StatisticsService } from './statistics.service';

describe('StatisticsService', () => {
    let service: StatisticsService;
    let repository: Repository<Statistics>;
    let gamificationService: GamificationService;

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
    };

    const mockGamificationService = {
        updateProgress: jest.fn(),
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
                    provide: GamificationService,
                    useValue: mockGamificationService,
                },
            ],
        }).compile();

        service = module.get<StatisticsService>(StatisticsService);
        repository = module.get<Repository<Statistics>>(getRepositoryToken(Statistics));
        gamificationService = module.get<GamificationService>(GamificationService);

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
                    totalMasteryScore: 0
                },
                weeklyProgress: [],
                monthlyProgress: [],
            };

            mockRepository.create.mockReturnValue(expectedStats);
            mockRepository.save.mockResolvedValue(expectedStats);

            const result = await service.create(createDto);

            expect(result).toEqual(expectedStats);
            expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                userId: createDto.userId,
            }));
            expect(mockRepository.save).toHaveBeenCalledWith(expectedStats);
        });
    });

    describe('updateLearningProgress', () => {
        it('should update learning progress correctly', async () => {
            const userId = 'test-user-id';
            const mockStatistics = {
                learningMetrics: {
                    totalLessonsCompleted: 5,
                    totalExercisesCompleted: 10,
                    averageScore: 85,
                    totalTimeSpentMinutes: 120,
                },
                categoryMetrics: {
                    [CategoryType.VOCABULARY]: {
                        type: CategoryType.VOCABULARY,
                        progress: {
                            totalExercises: 15,
                            averageScore: 80,
                        },
                    },
                },
                weeklyProgress: [],
                monthlyProgress: [],
            };

            mockRepository.findOne.mockResolvedValue(mockStatistics);
            mockRepository.save.mockImplementation(stats => stats);

            const result = await service.updateLearningProgress(
                userId,
                true,
                true,
                90,
                30,
                CategoryType.VOCABULARY
            );

            expect(result.learningMetrics.totalLessonsCompleted).toBe(6);
            expect(result.learningMetrics.totalExercisesCompleted).toBe(11);
            expect(result.learningMetrics.totalTimeSpentMinutes).toBe(150);
            expect(result.categoryMetrics[CategoryType.VOCABULARY].progress.totalExercises).toBe(16);
        });

        it('should create new statistics if not found', async () => {
            const userId = 'new-user-id';
            mockRepository.findOne.mockResolvedValue(null);
            mockRepository.create.mockImplementation(dto => ({
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
            }));
            mockRepository.save.mockImplementation(stats => stats);

            const result = await service.updateLearningProgress(
                userId,
                true,
                false,
                85,
                20,
                CategoryType.VOCABULARY
            );

            expect(result.learningMetrics.totalLessonsCompleted).toBe(1);
            expect(result.learningMetrics.totalExercisesCompleted).toBe(0);
            expect(mockRepository.create).toHaveBeenCalled();
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
            };

            mockRepository.findOne.mockResolvedValue(mockStatistics);

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

    describe('calculateConsistencyMetrics', () => {
        it('should calculate consistency metrics correctly', () => {
            const progress = [
                {
                    date: new Date('2024-03-25'),
                    lessonsCompleted: 2,
                    exercisesCompleted: 3,
                    averageScore: 85,
                    timeSpentMinutes: 45,
                    dailyGoalsAchieved: 2,
                    dailyGoalsTotal: 3,
                    focusScore: 75,
                    consistencyMetrics: {
                        dailyStreak: 3,
                        weeklyCompletion: 80,
                        regularityScore: 85,
                        timeDistribution: {
                            morning: 0,
                            afternoon: 45,
                            evening: 0,
                            night: 0
                        }
                    }
                },
                {
                    date: new Date('2024-03-26'),
                    lessonsCompleted: 3,
                    exercisesCompleted: 4,
                    averageScore: 90,
                    timeSpentMinutes: 60,
                    dailyGoalsAchieved: 3,
                    dailyGoalsTotal: 3,
                    focusScore: 80,
                    consistencyMetrics: {
                        dailyStreak: 4,
                        weeklyCompletion: 85,
                        regularityScore: 90,
                        timeDistribution: {
                            morning: 0,
                            afternoon: 60,
                            evening: 0,
                            night: 0
                        }
                    }
                }
            ];

            const result = service['calculateConsistencyScore'](progress);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThanOrEqual(100);
        });
    });

    describe('calculateTimeDistribution', () => {
        it('should calculate time distribution for a single day', () => {
            const date = new Date('2024-03-26T14:30:00'); // 2:30 PM
            const timeSpentMinutes = 60;

            const result = service['calculateTimeDistribution'](date, timeSpentMinutes);

            expect(result).toEqual({
                morning: 0,
                afternoon: 60,
                evening: 0,
                night: 0
            });
        });

        it('should calculate time distribution for multiple days', () => {
            const timeData = [
                { minutes: 60, date: new Date('2024-03-26T10:00:00') }, // Morning
                { minutes: 45, date: new Date('2024-03-26T15:00:00') }, // Afternoon
                { minutes: 30, date: new Date('2024-03-26T20:00:00') }  // Evening
            ];

            const result = service['calculateTimeDistribution'](timeData);

            expect(result).toHaveProperty('byHourOfDay');
            expect(result).toHaveProperty('peakHours');
            expect(result).toHaveProperty('preferredTimeOfDay');
        });
    });

    describe('calculateImprovementRate', () => {
        it('should calculate improvement rate between months', () => {
            const mockStatistics = {
                monthlyProgress: [
                    {
                        monthStartDate: new Date('2024-02-01'),
                        lessonsCompleted: 10,
                        exercisesCompleted: 20,
                        averageScore: 80
                    },
                    {
                        monthStartDate: new Date('2024-03-01'),
                        lessonsCompleted: 15,
                        exercisesCompleted: 25,
                        averageScore: 85
                    }
                ]
            } as Statistics;

            const currentMonth = mockStatistics.monthlyProgress[1];
            const result = service['calculateImprovementRate'](mockStatistics, currentMonth);

            expect(result).toBeGreaterThan(0);
        });
    });
}); 