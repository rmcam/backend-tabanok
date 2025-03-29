import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gamification } from '../../entities/gamification.entity';
import { MissionFrequency, MissionType } from '../../entities/mission.entity';
import { Season, SeasonType } from '../../entities/season.entity';
import { CulturalRewardService } from '../cultural-reward.service';

describe('CulturalRewardService', () => {
    let service: CulturalRewardService;
    let gamificationRepository: Repository<Gamification>;

    const mockGamificationRepository = {
        findOne: jest.fn(),
        save: jest.fn()
    };

    const mockSeason = {
        id: '1',
        name: 'Temporada de Prueba',
        description: 'Una temporada para pruebas',
        type: SeasonType.BETSCNATE,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        rewards: {
            points: 100,
            specialBadge: 'maestro_danza',
            culturalItems: ['danza_tradicional']
        },
        culturalElements: {
            traditions: ['Danza del Carnaval', 'Ritual de Bienvenida'],
            vocabulary: ['Taita', 'Mama', 'Wawa'],
            stories: ['Leyenda del Carnaval', 'Historia de los Ancestros']
        },
        missions: [
            {
                id: '1',
                title: 'Aprender Danza',
                description: 'Aprende una danza tradicional',
                rewardPoints: 50,
                targetValue: 3,
                type: MissionType.CULTURAL_CONTENT,
                frequency: MissionFrequency.WEEKLY,
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                completedBy: []
            }
        ],
        specialEvents: [],
        createdAt: new Date(),
        updatedAt: new Date()
    } as Season;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CulturalRewardService,
                {
                    provide: getRepositoryToken(Gamification),
                    useValue: mockGamificationRepository
                }
            ]
        }).compile();

        service = module.get<CulturalRewardService>(CulturalRewardService);
        gamificationRepository = module.get<Repository<Gamification>>(getRepositoryToken(Gamification));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('awardSeasonalReward', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should award cultural reward and update gamification profile', async () => {
            const mockGamification = {
                userId: '1',
                points: 1000,
                culturalAchievements: [],
                recentActivities: []
            };

            mockGamificationRepository.findOne.mockResolvedValue(mockGamification);
            mockGamificationRepository.save.mockImplementation(data => Promise.resolve(data));

            await service.awardSeasonalReward('1', mockSeason, 'maestro_danza');

            expect(mockGamificationRepository.save).toHaveBeenCalledWith(expect.objectContaining({
                points: 1500, // 1000 + 500 bonus
                culturalAchievements: expect.arrayContaining([
                    expect.objectContaining({
                        title: 'Maestro de la Danza Tradicional',
                        culturalValue: 'Preservación de danzas tradicionales'
                    })
                ])
            }));
        });

        it('should not award reward for invalid achievement type', async () => {
            const mockGamification = {
                userId: '1',
                points: 1000,
                culturalAchievements: [],
                recentActivities: []
            };

            mockGamificationRepository.findOne.mockResolvedValue(mockGamification);

            const invalidSeason = {
                ...mockSeason,
                type: SeasonType.JAJAN
            };

            await service.awardSeasonalReward('1', invalidSeason, 'maestro_danza');
            expect(mockGamificationRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('getCulturalProgress', () => {
        it('should calculate cultural progress correctly', async () => {
            const mockGamification = {
                culturalAchievements: [
                    {
                        culturalValue: 'Preservación de danzas tradicionales'
                    },
                    {
                        culturalValue: 'Preservación de rituales'
                    },
                    {
                        culturalValue: 'Preservación de danzas tradicionales'
                    }
                ]
            };

            mockGamificationRepository.findOne.mockResolvedValue(mockGamification);

            const progress = await service.getCulturalProgress('1');
            expect(progress).toEqual({
                totalAchievements: 3,
                culturalValue: 300,
                specializations: ['Preservación de danzas tradicionales', 'Preservación de rituales']
            });
        });

        it('should return default values for user without achievements', async () => {
            mockGamificationRepository.findOne.mockResolvedValue({
                culturalAchievements: null
            });

            const progress = await service.getCulturalProgress('1');
            expect(progress).toEqual({
                totalAchievements: 0,
                culturalValue: 0,
                specializations: []
            });
        });
    });
}); 