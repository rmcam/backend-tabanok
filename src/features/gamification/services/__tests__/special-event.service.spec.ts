import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Season, SeasonType } from '../../entities/season.entity';
import { EventType, SpecialEvent } from '../../entities/special-event.entity';
import { GamificationService } from '../../gamification.service';
import { SpecialEventService } from '../special-event.service';

describe('SpecialEventService', () => {
    let service: SpecialEventService;
    let specialEventRepository: Repository<SpecialEvent>;
    let seasonRepository: Repository<Season>;
    let gamificationService: GamificationService;

    const mockSpecialEventRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn()
    };

    const mockSeasonRepository = {
        findOne: jest.fn()
    };

    const mockGamificationService = {
        findByUserId: jest.fn(),
        addPoints: jest.fn(),
        updateStats: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SpecialEventService,
                {
                    provide: getRepositoryToken(SpecialEvent),
                    useValue: mockSpecialEventRepository
                },
                {
                    provide: getRepositoryToken(Season),
                    useValue: mockSeasonRepository
                },
                {
                    provide: GamificationService,
                    useValue: mockGamificationService
                }
            ]
        }).compile();

        service = module.get<SpecialEventService>(SpecialEventService);
        specialEventRepository = module.get<Repository<SpecialEvent>>(getRepositoryToken(SpecialEvent));
        seasonRepository = module.get<Repository<Season>>(getRepositoryToken(Season));
        gamificationService = module.get<GamificationService>(GamificationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createSpecialEvent', () => {
        it('should create a special event for a valid season', async () => {
            const seasonId = 'test-season-id';
            const mockSeason = {
                id: seasonId,
                type: SeasonType.BETSCNATE,
                startDate: new Date(),
                name: 'Bëtscnaté 2024',
                description: 'Temporada del Carnaval del Perdón',
                endDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
                culturalElements: { traditions: [], vocabulary: [], activities: [], stories: [] },
                missions: [],
                specialEvents: [],
                isActive: true,
                rewards: { points: 0, badges: [] },
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const eventData = {
                name: 'Test Event',
                type: EventType.FESTIVAL
            };

            mockSeasonRepository.findOne.mockResolvedValue(mockSeason);
            mockSpecialEventRepository.create.mockReturnValue({
                ...eventData,
                season: mockSeason
            });
            mockSpecialEventRepository.save.mockResolvedValue({
                id: 'test-event-id',
                ...eventData,
                season: mockSeason
            });

            const result = await service.createSpecialEvent(seasonId, eventData);

            expect(result).toHaveProperty('id', 'test-event-id');
            expect(result.season).toBe(mockSeason);
        });

        it('should throw NotFoundException when season not found', async () => {
            mockSeasonRepository.findOne.mockResolvedValue(null);
            await expect(service.createSpecialEvent('1', {}))
                .rejects.toThrow('Temporada con ID 1 no encontrada');
        });
    });

    describe('joinEvent', () => {
        it('should allow user to join event when meeting requirements', async () => {
            const mockEvent = {
                id: '1',
                requirements: {
                    minLevel: 3
                },
                participants: []
            };

            const mockGamification = {
                level: 5,
                culturalAchievements: []
            };

            mockSpecialEventRepository.findOne.mockResolvedValue(mockEvent);
            mockGamificationService.findByUserId.mockResolvedValue(mockGamification);

            await service.joinEvent('1', 'user1');

            expect(mockSpecialEventRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    participants: expect.arrayContaining([
                        expect.objectContaining({
                            userId: 'user1',
                            progress: 0
                        })
                    ])
                })
            );
        });

        it('should throw error when user does not meet level requirement', async () => {
            const mockEvent = {
                requirements: {
                    minLevel: 5
                }
            };

            const mockGamification = {
                level: 3
            };

            mockSpecialEventRepository.findOne.mockResolvedValue(mockEvent);
            mockGamificationService.findByUserId.mockResolvedValue(mockGamification);

            await expect(service.joinEvent('1', 'user1'))
                .rejects.toThrow('Necesitas nivel 5 para unirte a este evento');
        });
    });

    describe('updateEventProgress', () => {
        it('should update progress and award rewards when completed', async () => {
            const mockEvent = {
                id: '1',
                name: 'Test Event',
                participants: [
                    { userId: 'user1', progress: 50 }
                ],
                rewards: {
                    points: 100,
                    culturalValue: 50
                },
                season: { type: SeasonType.BETSCNATE }
            };

            mockSpecialEventRepository.findOne.mockResolvedValue(mockEvent);
            mockGamificationService.findByUserId.mockResolvedValue({
                culturalAchievements: [],
                badges: [],
                stats: { culturalContributions: 1 }
            });

            await service.updateEventProgress('1', 'user1', 100);

            expect(mockSpecialEventRepository.save).toHaveBeenCalled();
            expect(mockGamificationService.addPoints).toHaveBeenCalledWith(
                'user1',
                100,
                'special_event_completed',
                '¡Evento completado: Test Event!'
            );
        });

        it('should throw error when user is not participating', async () => {
            const mockEvent = {
                participants: []
            };

            mockSpecialEventRepository.findOne.mockResolvedValue(mockEvent);

            await expect(service.updateEventProgress('1', 'user1', 50))
                .rejects.toThrow('No estás participando en este evento');
        });
    });

    describe('generateSeasonEvents', () => {
        it('should generate events for Bëtscnaté season', async () => {
            const mockSeason = {
                id: 'test-season-id',
                type: SeasonType.BETSCNATE,
                startDate: new Date(),
                name: 'Bëtscnaté 2024',
                description: 'Temporada del Carnaval del Perdón',
                endDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
                culturalElements: { traditions: [], vocabulary: [], activities: [], stories: [] },
                missions: [],
                specialEvents: [],
                isActive: true,
                rewards: { points: 0, badges: [] },
                createdAt: new Date(),
                updatedAt: new Date()
            } as Season;

            mockSeasonRepository.findOne.mockResolvedValue(mockSeason);
            mockSpecialEventRepository.create.mockImplementation(data => ({
                ...data,
                name: 'Gran Celebración del Bëtscnaté',
                type: EventType.FESTIVAL,
                rewards: {
                    points: 500,
                    culturalValue: 300,
                    specialBadge: {
                        id: 'betscnate-master',
                        name: 'Maestro del Bëtscnaté',
                        icon: '🎭'
                    }
                }
            }));
            mockSpecialEventRepository.save.mockImplementation(data => ({
                id: 'generated-event-id',
                ...data
            }));

            await service.generateSeasonEvents(mockSeason);

            expect(mockSpecialEventRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Gran Celebración del Bëtscnaté',
                    type: EventType.FESTIVAL,
                    startDate: mockSeason.startDate,
                    isActive: true
                })
            );
        });
    });
}); 