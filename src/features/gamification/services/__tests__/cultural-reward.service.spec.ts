import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gamification } from '../../entities/gamification.entity';
import { MissionFrequency, MissionType } from '../../entities/mission.entity';
import { Season, SeasonType } from '../../entities/season.entity';
import { CulturalRewardService } from '../cultural-reward.service';
import { User } from '../../../../auth/entities/user.entity';
import { CulturalAchievement, AchievementCategory, AchievementTier } from '../../entities/cultural-achievement.entity';
import { UserReward } from '../../entities/user-reward.entity';

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

    const mockUserRepository = {
        findOne: jest.fn(),
        save: jest.fn()
    };

    const mockCulturalAchievementRepository = {
        findOne: jest.fn()
    };

    const mockUserRewardRepository = {
        create: jest.fn(),
        save: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CulturalRewardService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository
                },
                {
                    provide: getRepositoryToken(CulturalAchievement),
                    useValue: mockCulturalAchievementRepository
                },
                {
                    provide: getRepositoryToken(UserReward),
                    useValue: mockUserRewardRepository
                },
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

    describe('calculateReward', () => {
        it('should return cultural achievement by name', async () => {
            const mockAchievement = {
                id: '1',
                name: 'maestro_danza',
                description: 'Logro cultural',
                category: AchievementCategory.DANZA,
                tier: AchievementTier.ORO,
                requirements: [{
                    type: 'minPoints',
                    value: 100,
                    description: 'Mínimo 100 puntos'
                }],
                pointsReward: 500,
                expirationDays: 30,
                additionalRewards: [],
                imageUrl: null,
                isActive: true,
                isSecret: false,
                points: 0,
                users: [],
                createdAt: new Date(),
                updatedAt: new Date()
            } as CulturalAchievement;

            mockCulturalAchievementRepository.findOne.mockResolvedValue(mockAchievement);

            const result = await service.calculateReward({} as User, 'maestro_danza');
            expect(result).toEqual(mockAchievement);
            expect(mockCulturalAchievementRepository.findOne).toHaveBeenCalledWith({
                where: { name: 'maestro_danza' }
            });
        });

        it('should return null for non-existent achievement', async () => {
            mockCulturalAchievementRepository.findOne.mockResolvedValue(null);
            const result = await service.calculateReward({} as User, 'unknown');
            expect(result).toBeNull();
        });
    });

    describe('validateRequirements', () => {
        it('should validate achievement requirements', async () => {
            const mockUser = { points: 150 } as User;
            const mockAchievement = {
                id: '1',
                name: 'test',
                description: 'Test',
                category: AchievementCategory.LENGUA,
                tier: AchievementTier.BRONCE,
                requirements: [{
                    type: 'minPoints',
                    value: 100,
                    description: 'Mínimo 100 puntos'
                }],
                pointsReward: 100,
                expirationDays: null,
                additionalRewards: [],
                imageUrl: null,
                isActive: true,
                isSecret: false,
                points: 0,
                users: [],
                createdAt: new Date(),
                updatedAt: new Date()
            } as CulturalAchievement;

            const result = await service.validateRequirements(mockUser, mockAchievement);
            expect(result).toBe(true);
        });
    });

    describe('awardCulturalReward', () => {
        it('should award cultural reward to user', async () => {
            const mockUser = { id: '1', points: 100 };
            const mockAchievement = {
                id: '2',
                name: 'maestro_danza',
                description: 'Maestro de la Danza',
                category: AchievementCategory.DANZA,
                tier: AchievementTier.ORO,
                requirements: [{
                    type: 'minPoints',
                    value: 50,
                    description: 'Mínimo 50 puntos'
                }],
                pointsReward: 500,
                expirationDays: 30,
                additionalRewards: [],
                imageUrl: null,
                isActive: true,
                isSecret: false,
                points: 0,
                users: [],
                createdAt: new Date(),
                updatedAt: new Date()
            } as CulturalAchievement;
            
            mockUserRepository.findOne.mockResolvedValue(mockUser);
            mockCulturalAchievementRepository.findOne.mockResolvedValue(mockAchievement);
            mockUserRewardRepository.create.mockReturnValue({});
            mockUserRewardRepository.save.mockResolvedValue({});

            const result = await service.awardCulturalReward('1', 'maestro_danza');
            expect(result).toBeDefined();
            expect(mockUserRewardRepository.create).toHaveBeenCalledWith(expect.objectContaining({
                rewardId: '2',
                metadata: expect.objectContaining({
                    achievementName: 'maestro_danza'
                })
            }));
        });
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
