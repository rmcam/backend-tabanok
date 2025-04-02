import { Test, TestingModule } from '@nestjs/testing';
import { CategoryType } from '../statistics/types/category.enum';
import { StatisticsService } from '../statistics/statistics.service';
import { RecommendationPriority, RecommendationType } from './interfaces/recommendation.interface';
import { RecommendationsService } from './recommendations.service';

describe('RecommendationsService', () => {
    let service: RecommendationsService;
    let statisticsService: StatisticsService;

    const mockStatistics = {
        learningMetrics: {
            totalLessonsCompleted: 10,
            totalExercisesCompleted: 15,
            averageScore: 85
        },
        categoryMetrics: {
            [CategoryType.VOCABULARY]: {
                progress: {
                    completedExercises: 8,
                    averageScore: 90
                }
            },
            [CategoryType.GRAMMAR]: {
                progress: {
                    completedExercises: 7,
                    averageScore: 80
                }
            }
        },
        weeklyProgress: [
            {
                weekStartDate: new Date('2024-03-20T14:00:00'),
                lessonsCompleted: 2,
                exercisesCompleted: 3,
                averageScore: 85,
                timeSpentMinutes: 45
            }
        ],
        learningPath: {
            customGoals: [
                {
                    category: CategoryType.VOCABULARY,
                    target: 100,
                    deadline: new Date('2024-04-01')
                }
            ]
        }
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RecommendationsService,
                {
                    provide: StatisticsService,
                    useValue: {
                        findByUserId: jest.fn().mockResolvedValue(mockStatistics)
                    }
                }
            ],
        }).compile();

        service = module.get<RecommendationsService>(RecommendationsService);
        statisticsService = module.get<StatisticsService>(StatisticsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('generateRecommendations', () => {
        it('should generate recommendations based on user statistics', async () => {
            const recommendations = await service.generateRecommendations('user123');

            expect(recommendations).toBeDefined();
            expect(Array.isArray(recommendations)).toBe(true);
            expect(recommendations.length).toBeLessThanOrEqual(5);

            recommendations.forEach(recommendation => {
                expect(recommendation).toHaveProperty('id');
                expect(recommendation).toHaveProperty('type');
                expect(recommendation).toHaveProperty('priority');
                expect(recommendation).toHaveProperty('category');
                expect(recommendation).toHaveProperty('estimatedDuration');
                expect(recommendation).toHaveProperty('difficulty');
                expect(recommendation).toHaveProperty('description');
                expect(recommendation).toHaveProperty('reason');
                expect(recommendation).toHaveProperty('expectedOutcomes');
                expect(recommendation).toHaveProperty('adaptiveFeedback');
            });
        });

        it('should prioritize recommendations correctly', async () => {
            const recommendations = await service.generateRecommendations('user123');

            // Verificar que las recomendaciones estén ordenadas por prioridad
            const priorities = recommendations.map(r => r.priority);
            const sortedPriorities = [...priorities].sort((a, b) => {
                const weights = {
                    [RecommendationPriority.HIGH]: 3,
                    [RecommendationPriority.MEDIUM]: 2,
                    [RecommendationPriority.LOW]: 1
                };
                return weights[b] - weights[a];
            });

            expect(priorities).toEqual(sortedPriorities);
        });

        it('should include strength-based recommendations for high-performing categories', async () => {
            const recommendations = await service.generateRecommendations('user123');

            const strengthRecommendations = recommendations.filter(
                r => r.type === RecommendationType.CHALLENGE
            );

            expect(strengthRecommendations.length).toBeGreaterThan(0);
            expect(strengthRecommendations[0].category).toBe(CategoryType.VOCABULARY);
        });

        it('should calculate completion rate correctly', async () => {
            const recommendations = await service.generateRecommendations('user123');

            // Verificar que las recomendaciones tengan en cuenta la tasa de finalización
            expect(recommendations.some(r => r.type === RecommendationType.PRACTICE)).toBe(true);
        });
    });
});
