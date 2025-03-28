import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Season, SeasonType } from '../../entities/season.entity';
import { MissionService } from '../mission.service';
import { SeasonService } from '../season.service';

describe('SeasonService', () => {
    let service: SeasonService;
    let seasonRepository: Repository<Season>;
    let missionService: MissionService;

    const mockSeasonRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn()
    };

    const mockMissionService = {
        createMission: jest.fn()
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SeasonService,
                {
                    provide: getRepositoryToken(Season),
                    useValue: mockSeasonRepository
                },
                {
                    provide: MissionService,
                    useValue: mockMissionService
                }
            ]
        }).compile();

        service = module.get<SeasonService>(SeasonService);
        seasonRepository = module.get<Repository<Season>>(getRepositoryToken(Season));
        missionService = module.get<MissionService>(MissionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createSeason', () => {
        it('should create a new season', async () => {
            const seasonData = {
                type: SeasonType.BETSCNATE,
                name: 'Test Season',
                description: 'Test Description'
            };

            const expectedSeason = { ...seasonData, id: '1' };
            mockSeasonRepository.create.mockReturnValue(seasonData);
            mockSeasonRepository.save.mockResolvedValue(expectedSeason);

            const result = await service.createSeason(seasonData);
            expect(result).toEqual(expectedSeason);
            expect(mockSeasonRepository.create).toHaveBeenCalledWith(seasonData);
            expect(mockSeasonRepository.save).toHaveBeenCalled();
        });
    });

    describe('getCurrentSeason', () => {
        it('should return the current active season', async () => {
            const mockSeason = {
                id: '1',
                type: SeasonType.BETSCNATE,
                isActive: true,
                missions: []
            };

            mockSeasonRepository.findOne.mockResolvedValue(mockSeason);
            const result = await service.getCurrentSeason();
            expect(result).toEqual(mockSeason);
        });

        it('should throw NotFoundException when no active season exists', async () => {
            mockSeasonRepository.findOne.mockResolvedValue(null);
            await expect(service.getCurrentSeason()).rejects.toThrow('No hay una temporada activa actualmente');
        });
    });

    describe('generateBetscnateSeason', () => {
        it('should generate a Bëtscnaté season with missions', async () => {
            const mockSeason = {
                id: '1',
                type: SeasonType.BETSCNATE,
                name: 'Temporada del Bëtscnaté',
                missions: []
            };

            mockSeasonRepository.create.mockReturnValue(mockSeason);
            mockSeasonRepository.save.mockResolvedValue(mockSeason);
            mockMissionService.createMission.mockResolvedValue({});

            const result = await service.generateBetscnateSeason();
            expect(result).toEqual(mockSeason);
            expect(mockMissionService.createMission).toHaveBeenCalled();
        });
    });

    describe('getSeasonProgress', () => {
        it('should calculate season progress correctly', async () => {
            const mockSeason = {
                missions: [
                    {
                        rewardPoints: 100,
                        completedBy: [{ userId: '1', completedAt: new Date() }]
                    },
                    {
                        rewardPoints: 200,
                        completedBy: []
                    }
                ]
            };

            mockSeasonRepository.findOne.mockResolvedValue(mockSeason);

            const progress = await service.getSeasonProgress('1');
            expect(progress).toEqual({
                completedMissions: 1,
                totalMissions: 2,
                earnedPoints: 100,
                rank: 'Aprendiz'
            });
        });
    });
}); 