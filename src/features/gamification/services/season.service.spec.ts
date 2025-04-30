import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { SeasonService } from './season.service';
import { Season, SeasonType } from '../entities/season.entity';
import { MissionService } from './mission.service';

describe('SeasonService', () => {
  let service: SeasonService;
  let seasonRepositoryMock;
  let missionServiceMock;

  beforeEach(async () => {
    seasonRepositoryMock = {
      // Mock methods used by SeasonService
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };
    missionServiceMock = {
      // Mock methods used by SeasonService
      createMission: jest.fn(),
      // Add other methods as needed based on SeasonService implementation
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeasonService,
        {
          provide: getRepositoryToken(Season),
          useValue: seasonRepositoryMock,
        },
        {
          provide: MissionService,
          useValue: missionServiceMock,
        },
      ],
    }).compile();

    service = module.get<SeasonService>(SeasonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSeason', () => {
    it('should create and save a new season', async () => {
      const seasonData = { name: 'Test Season', type: SeasonType.BETSCNATE };
      const createdSeason = { id: '1', ...seasonData };
      seasonRepositoryMock.create.mockReturnValue(createdSeason);
      seasonRepositoryMock.save.mockResolvedValue(createdSeason);

      const result = await service.createSeason(seasonData);

      expect(seasonRepositoryMock.create).toHaveBeenCalledWith(seasonData);
      expect(seasonRepositoryMock.save).toHaveBeenCalledWith(createdSeason);
      expect(result).toEqual(createdSeason);
    });
  });

  describe('getCurrentSeason', () => {
    it('should return the current active season', async () => {
      const mockSeason = {
        id: 'current-season-id',
        name: 'Current Season',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        isActive: true,
        missions: [],
      };
      seasonRepositoryMock.findOne.mockResolvedValue(mockSeason);

      const result = await service.getCurrentSeason();

      expect(seasonRepositoryMock.findOne).toHaveBeenCalled();
      expect(result).toEqual(mockSeason);
    });

    it('should throw NotFoundException if no active season is found', async () => {
      seasonRepositoryMock.findOne.mockResolvedValue(undefined);

      await expect(service.getCurrentSeason()).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateBetscnateSeason', () => {
    it('should generate and save the Betscnate season and its missions', async () => {
      const mockSeason = {
        id: 'betscnate-season-id',
        type: SeasonType.BETSCNATE,
        name: 'Temporada del Bëtscnaté',
        description: 'Celebración del Carnaval Kamëntsá con misiones relacionadas a música, danza y rituales tradicionales',
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        culturalElements: {
          traditions: ['Danza tradicional', 'Música ritual', 'Ceremonias de perdón'],
          vocabulary: ['Bëtscnaté', 'Música', 'Danza', 'Ritual'],
          stories: ['Historia del Carnaval', 'Significado del perdón']
        },
        rewards: {
          points: 1000,
          specialBadge: 'Maestro del Bëtscnaté',
          culturalItems: ['Máscara tradicional', 'Vestimenta ceremonial']
        }
      };

      seasonRepositoryMock.create.mockReturnValue(mockSeason);
      seasonRepositoryMock.save.mockResolvedValue(mockSeason);
      missionServiceMock.createMission.mockResolvedValue({}); // Mock mission creation

      const result = await service.generateBetscnateSeason();

      expect(seasonRepositoryMock.create).toHaveBeenCalledWith(expect.objectContaining({
        type: SeasonType.BETSCNATE,
        name: 'Temporada del Bëtscnaté',
      }));
      expect(seasonRepositoryMock.save).toHaveBeenCalledWith(mockSeason);
      expect(missionServiceMock.createMission).toHaveBeenCalledTimes(2); // Expect 2 missions to be created
      expect(result).toEqual(mockSeason);
    });
  });

  describe('generateJajanSeason', () => {
    it('should generate and save the Jajan season and its missions', async () => {
      const mockSeason = {
        id: 'jajan-season-id',
        type: SeasonType.JAJAN,
        name: 'Temporada de Jajañ',
        description: 'Temporada de siembra y conexión con la tierra, enfocada en prácticas agrícolas tradicionales',
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        culturalElements: {
          traditions: ['Rituales de siembra', 'Medicina tradicional', 'Cuidado de la tierra'],
          vocabulary: ['Jajañ', 'Plantas medicinales', 'Agricultura'],
          stories: ['Sabiduría de la tierra', 'Ciclos naturales']
        },
        rewards: {
          points: 1200,
          specialBadge: 'Guardián de la Tierra',
          culturalItems: ['Semillas sagradas', 'Libro de medicina tradicional']
        }
      };

      seasonRepositoryMock.create.mockReturnValue(mockSeason);
      seasonRepositoryMock.save.mockResolvedValue(mockSeason);
      missionServiceMock.createMission.mockResolvedValue({}); // Mock mission creation

      const result = await service.generateJajanSeason();

      expect(seasonRepositoryMock.create).toHaveBeenCalledWith(expect.objectContaining({
        type: SeasonType.JAJAN,
        name: 'Temporada de Jajañ',
      }));
      expect(seasonRepositoryMock.save).toHaveBeenCalledWith(mockSeason);
      expect(missionServiceMock.createMission).toHaveBeenCalledTimes(2); // Expect 2 missions to be created
      expect(result).toEqual(mockSeason);
    });
  });

  describe('generateBengbeBetsaSeason', () => {
    it('should generate and save the Bengbe Betsa season and its missions', async () => {
      const mockSeason = {
        id: 'bengbe-betsa-season-id',
        type: SeasonType.BENGBE_BETSA,
        name: 'Temporada de Bëngbe Bëtsá',
        description: 'Temporada dedicada a la espiritualidad Kamëntsá, enfocada en historias tradicionales y prácticas espirituales',
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        culturalElements: {
          traditions: ['Ceremonias espirituales', 'Medicina tradicional', 'Rituales de sanación'],
          vocabulary: ['Bëngbe Bëtsá', 'Espíritu', 'Sanación', 'Sabiduría'],
          stories: ['Historias de los ancestros', 'Enseñanzas espirituales']
        },
        rewards: {
          points: 1500,
          specialBadge: 'Guardián Espiritual',
          culturalItems: ['Libro de oraciones', 'Elementos ceremoniales']
        }
      };

      seasonRepositoryMock.create.mockReturnValue(mockSeason);
      seasonRepositoryMock.save.mockResolvedValue(mockSeason);
      missionServiceMock.createMission.mockResolvedValue({}); // Mock mission creation

      const result = await service.generateBengbeBetsaSeason();

      expect(seasonRepositoryMock.create).toHaveBeenCalledWith(expect.objectContaining({
        type: SeasonType.BENGBE_BETSA,
        name: 'Temporada de Bëngbe Bëtsá',
      }));
      expect(seasonRepositoryMock.save).toHaveBeenCalledWith(mockSeason);
      expect(missionServiceMock.createMission).toHaveBeenCalledTimes(2); // Expect 2 missions to be created
      expect(result).toEqual(mockSeason);
    });
  });

  describe('generateAnteuanSeason', () => {
    it('should generate and save the Anteuan season and its missions', async () => {
      const mockSeason = {
        id: 'anteuan-season-id',
        type: SeasonType.ANTEUAN,
        name: 'Temporada de Anteuán',
        description: 'Temporada dedicada a los ancestros y la memoria histórica del pueblo Kamëntsá',
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        culturalElements: {
          traditions: ['Historias ancestrales', 'Artesanías tradicionales', 'Técnicas ancestrales'],
          vocabulary: ['Anteuán', 'Ancestros', 'Memoria', 'Tradición'],
          stories: ['Historias de los mayores', 'Leyendas tradicionales']
        },
        rewards: {
          points: 1800,
          specialBadge: 'Guardián de la Memoria',
          culturalItems: ['Tejido tradicional', 'Libro de historias ancestrales']
        }
      };

      seasonRepositoryMock.create.mockReturnValue(mockSeason);
      seasonRepositoryMock.save.mockResolvedValue(mockSeason);
      missionServiceMock.createMission.mockResolvedValue({}); // Mock mission creation

      const result = await service.generateAnteuanSeason();

      expect(seasonRepositoryMock.create).toHaveBeenCalledWith(expect.objectContaining({
        type: SeasonType.ANTEUAN,
        name: 'Temporada de Anteuán',
      }));
      expect(seasonRepositoryMock.save).toHaveBeenCalledWith(mockSeason);
      expect(missionServiceMock.createMission).toHaveBeenCalledTimes(2); // Expect 2 missions to be created
      expect(result).toEqual(mockSeason);
    });
  });

  describe('generateSeasonDynamicMissions', () => {
    it('should generate dynamic missions for BETSCNATE season', async () => {
      const mockSeason = { id: 'season-id', type: SeasonType.BETSCNATE, startDate: new Date(), endDate: new Date() };
      const userId = 'user-id';

      await (service as any).generateSeasonDynamicMissions(mockSeason, userId);

      expect(missionServiceMock.createMission).toHaveBeenCalledTimes(1);
      expect(missionServiceMock.createMission).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Maestro de la Danza',
        type: 'CULTURAL_CONTENT',
        season: mockSeason,
      }));
    });

    it('should generate dynamic missions for JAJAN season', async () => {
      const mockSeason = { id: 'season-id', type: SeasonType.JAJAN, startDate: new Date(), endDate: new Date() };
      const userId = 'user-id';

      await (service as any).generateSeasonDynamicMissions(mockSeason, userId);

      expect(missionServiceMock.createMission).toHaveBeenCalledTimes(1);
      expect(missionServiceMock.createMission).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Sabio de las Plantas',
        type: 'CULTURAL_CONTENT',
        season: mockSeason,
      }));
    });

    it('should generate dynamic missions for BENGBE_BETSA season', async () => {
      const mockSeason = { id: 'season-id', type: SeasonType.BENGBE_BETSA, startDate: new Date(), endDate: new Date() };
      const userId = 'user-id';

      await (service as any).generateSeasonDynamicMissions(mockSeason, userId);

      expect(missionServiceMock.createMission).toHaveBeenCalledTimes(1);
      expect(missionServiceMock.createMission).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Guardián de la Sabiduría',
        type: 'COMMUNITY_INTERACTION',
        season: mockSeason,
      }));
    });

    it('should generate dynamic missions for ANTEUAN season', async () => {
      const mockSeason = { id: 'season-id', type: SeasonType.ANTEUAN, startDate: new Date(), endDate: new Date() };
      const userId = 'user-id';

      await (service as any).generateSeasonDynamicMissions(mockSeason, userId);

      expect(missionServiceMock.createMission).toHaveBeenCalledTimes(1);
      expect(missionServiceMock.createMission).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Narrador de Historias',
        type: 'CULTURAL_CONTENT',
        season: mockSeason,
      }));
    });

    it('should not generate dynamic missions for unknown season type', async () => {
      const mockSeason = { id: 'season-id', type: 'UNKNOWN_TYPE', startDate: new Date(), endDate: new Date() };
      const userId = 'user-id';

      await (service as any).generateSeasonDynamicMissions(mockSeason, userId);

      expect(missionServiceMock.createMission).not.toHaveBeenCalled();
    });
  });

  describe('startNewSeason', () => {
    let generateBetscnateSeasonSpy: jest.SpyInstance;
    let generateJajanSeasonSpy: jest.SpyInstance;
    let generateBengbeBetsaSeasonSpy: jest.SpyInstance;
    let generateAnteuanSeasonSpy: jest.SpyInstance;
    let generateSeasonMissionsSpy: jest.SpyInstance;
    let generateSeasonDynamicMissionsSpy: jest.SpyInstance;

    beforeEach(() => {
      generateBetscnateSeasonSpy = jest.spyOn(service as any, 'generateBetscnateSeason').mockResolvedValue({});
      generateJajanSeasonSpy = jest.spyOn(service as any, 'generateJajanSeason').mockResolvedValue({});
      generateBengbeBetsaSeasonSpy = jest.spyOn(service as any, 'generateBengbeBetsaSeason').mockResolvedValue({});
      generateAnteuanSeasonSpy = jest.spyOn(service as any, 'generateAnteuanSeason').mockResolvedValue({});
      generateSeasonMissionsSpy = jest.spyOn(service as any, 'generateSeasonMissions').mockResolvedValue(undefined);
      generateSeasonDynamicMissionsSpy = jest.spyOn(service as any, 'generateSeasonDynamicMissions').mockResolvedValue(undefined);
    });

    it('should call generateBetscnateSeason and mission generation methods for BETSCNATE type', async () => {
      const seasonType = SeasonType.BETSCNATE;
      const userId = 'user-id';
      const mockSeason = { id: 'new-season-id', type: seasonType };
      generateBetscnateSeasonSpy.mockResolvedValue(mockSeason);

      const result = await service.startNewSeason(seasonType, userId);

      expect(generateBetscnateSeasonSpy).toHaveBeenCalled();
      expect(generateSeasonMissionsSpy).toHaveBeenCalledWith(mockSeason);
      expect(generateSeasonDynamicMissionsSpy).toHaveBeenCalledWith(mockSeason, userId);
      expect(result).toEqual(mockSeason);
    });

    it('should call generateJajanSeason and mission generation methods for JAJAN type', async () => {
      const seasonType = SeasonType.JAJAN;
      const userId = 'user-id';
      const mockSeason = { id: 'new-season-id', type: seasonType };
      generateJajanSeasonSpy.mockResolvedValue(mockSeason);

      const result = await service.startNewSeason(seasonType, userId);

      expect(generateJajanSeasonSpy).toHaveBeenCalled();
      expect(generateSeasonMissionsSpy).toHaveBeenCalledWith(mockSeason);
      expect(generateSeasonDynamicMissionsSpy).toHaveBeenCalledWith(mockSeason, userId);
      expect(result).toEqual(mockSeason);
    });

    it('should call generateBengbeBetsaSeason and mission generation methods for BENGBE_BETSA type', async () => {
      const seasonType = SeasonType.BENGBE_BETSA;
      const userId = 'user-id';
      const mockSeason = { id: 'new-season-id', type: seasonType };
      generateBengbeBetsaSeasonSpy.mockResolvedValue(mockSeason);

      const result = await service.startNewSeason(seasonType, userId);

      expect(generateBengbeBetsaSeasonSpy).toHaveBeenCalled();
      expect(generateSeasonMissionsSpy).toHaveBeenCalledWith(mockSeason);
      expect(generateSeasonDynamicMissionsSpy).toHaveBeenCalledWith(mockSeason, userId);
      expect(result).toEqual(mockSeason);
    });

    it('should call generateAnteuanSeason and mission generation methods for ANTEUAN type', async () => {
      const seasonType = SeasonType.ANTEUAN;
      const userId = 'user-id';
      const mockSeason = { id: 'new-season-id', type: seasonType };
      generateAnteuanSeasonSpy.mockResolvedValue(mockSeason);

      const result = await service.startNewSeason(seasonType, userId);

      expect(generateAnteuanSeasonSpy).toHaveBeenCalled();
      expect(generateSeasonMissionsSpy).toHaveBeenCalledWith(mockSeason);
      expect(generateSeasonDynamicMissionsSpy).toHaveBeenCalledWith(mockSeason, userId);
      expect(result).toEqual(mockSeason);
    });

    it('should throw an error for invalid season type', async () => {
      const seasonType = 'INVALID_TYPE' as any;
      const userId = 'user-id';

      await expect(service.startNewSeason(seasonType, userId)).rejects.toThrow('Tipo de temporada no válido');
      expect(generateBetscnateSeasonSpy).not.toHaveBeenCalled();
      expect(generateJajanSeasonSpy).not.toHaveBeenCalled();
      expect(generateBengbeBetsaSeasonSpy).not.toHaveBeenCalled();
      expect(generateAnteuanSeasonSpy).not.toHaveBeenCalled();
      expect(generateSeasonMissionsSpy).not.toHaveBeenCalled();
      expect(generateSeasonDynamicMissionsSpy).not.toHaveBeenCalled();
    });
  });

  describe('getSeasonProgress', () => {
    let getCurrentSeasonSpy: jest.SpyInstance;

    beforeEach(() => {
      getCurrentSeasonSpy = jest.spyOn(service, 'getCurrentSeason');
    });

    it('should calculate season progress correctly when no missions are completed', async () => {
      const userId = 'user-id';
      const mockSeason = {
        id: 'current-season-id',
        name: 'Current Season',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        isActive: true,
        missions: [
          { id: 'mission-1', rewardPoints: 100, completedBy: [] },
          { id: 'mission-2', rewardPoints: 200, completedBy: [] },
          { id: 'mission-3', rewardPoints: 150, completedBy: [] },
        ],
      };
      getCurrentSeasonSpy.mockResolvedValue(mockSeason);

      const result = await service.getSeasonProgress(userId);

      expect(getCurrentSeasonSpy).toHaveBeenCalled();
      expect(result).toEqual({
        completedMissions: 0,
        totalMissions: 3,
        earnedPoints: 0,
        rank: 'Principiante',
      });
    });

    it('should calculate season progress correctly when some missions are completed', async () => {
      const userId = 'user-id';
      const mockSeason = {
        id: 'current-season-id',
        name: 'Current Season',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        isActive: true,
        missions: [
          { id: 'mission-1', rewardPoints: 100, completedBy: [{ userId: 'other-user' }] },
          { id: 'mission-2', rewardPoints: 200, completedBy: [{ userId: userId, completedAt: new Date() }] },
          { id: 'mission-3', rewardPoints: 150, completedBy: [{ userId: userId, completedAt: new Date() }] },
          { id: 'mission-4', rewardPoints: 50, completedBy: [] },
        ],
      };
      getCurrentSeasonSpy.mockResolvedValue(mockSeason);

      const result = await service.getSeasonProgress(userId);

      expect(getCurrentSeasonSpy).toHaveBeenCalled();
      expect(result).toEqual({
        completedMissions: 2,
        totalMissions: 4,
        earnedPoints: 350, // 200 + 150
        rank: 'Aprendiz Avanzado', // 2/4 = 50% >= 50%
      });
    });

    it('should calculate season progress correctly when all missions are completed', async () => {
      const userId = 'user-id';
      const mockSeason = {
        id: 'current-season-id',
        name: 'Current Season',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        isActive: true,
        missions: [
          { id: 'mission-1', rewardPoints: 100, completedBy: [{ userId: userId, completedAt: new Date() }] },
          { id: 'mission-2', rewardPoints: 200, completedBy: [{ userId: userId, completedAt: new Date() }] },
        ],
      };
      getCurrentSeasonSpy.mockResolvedValue(mockSeason);

      const result = await service.getSeasonProgress(userId);

      expect(getCurrentSeasonSpy).toHaveBeenCalled();
      expect(result).toEqual({
        completedMissions: 2,
        totalMissions: 2,
        earnedPoints: 300, // 100 + 200
        rank: 'Maestro', // 2/2 = 100% >= 75%
      });
    });

    it('should throw NotFoundException if getCurrentSeason throws NotFoundException', async () => {
      const userId = 'user-id';
      getCurrentSeasonSpy.mockRejectedValue(new NotFoundException('No hay una temporada activa actualmente'));

      await expect(service.getSeasonProgress(userId)).rejects.toThrow(NotFoundException);
      expect(getCurrentSeasonSpy).toHaveBeenCalled();
    });
  });

  describe('generateSeasonMissions', () => {
    it('should generate static missions for BETSCNATE season', async () => {
      const mockSeason = { id: 'season-id', type: SeasonType.BETSCNATE, startDate: new Date(), endDate: new Date() };

      await (service as any).generateSeasonMissions(mockSeason);

      expect(missionServiceMock.createMission).toHaveBeenCalledTimes(2);
      expect(missionServiceMock.createMission).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Danzas del Bëtscnaté',
        type: 'CULTURAL_CONTENT',
        season: mockSeason,
      }));
      expect(missionServiceMock.createMission).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Maestro del Ritual',
        type: 'COMMUNITY_INTERACTION',
        season: mockSeason,
      }));
    });

    it('should generate static missions for JAJAN season', async () => {
      const mockSeason = { id: 'season-id', type: SeasonType.JAJAN, startDate: new Date(), endDate: new Date() };

      await (service as any).generateSeasonMissions(mockSeason);

      expect(missionServiceMock.createMission).toHaveBeenCalledTimes(2);
      expect(missionServiceMock.createMission).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Conocimiento de Plantas Medicinales',
        type: 'CULTURAL_CONTENT',
        season: mockSeason,
      }));
      expect(missionServiceMock.createMission).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Guardián de semillas',
        type: 'COMMUNITY_INTERACTION',
        season: mockSeason,
      }));
    });

    it('should generate static missions for BENGBE_BETSA season', async () => {
      const mockSeason = { id: 'season-id', type: SeasonType.BENGBE_BETSA, startDate: new Date(), endDate: new Date() };

      await (service as any).generateSeasonMissions(mockSeason);

      expect(missionServiceMock.createMission).toHaveBeenCalledTimes(2);
      expect(missionServiceMock.createMission).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Aprendiz Espiritual',
        type: 'CULTURAL_CONTENT',
        season: mockSeason,
      }));
      expect(missionServiceMock.createMission).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Guardián de la Medicina',
        type: 'COMMUNITY_INTERACTION',
        season: mockSeason,
      }));
    });

    it('should generate static missions for ANTEUAN season', async () => {
      const mockSeason = { id: 'season-id', type: SeasonType.ANTEUAN, startDate: new Date(), endDate: new Date() };

      await (service as any).generateSeasonMissions(mockSeason);

      expect(missionServiceMock.createMission).toHaveBeenCalledTimes(2);
      expect(missionServiceMock.createMission).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Recopilador de Historias',
        type: 'CULTURAL_CONTENT',
        season: mockSeason,
      }));
      expect(missionServiceMock.createMission).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Artesano Tradicional',
        type: 'COMMUNITY_INTERACTION',
        season: mockSeason,
      }));
    });

    it('should not generate static missions for unknown season type', async () => {
      const mockSeason = { id: 'season-id', type: 'UNKNOWN_TYPE', startDate: new Date(), endDate: new Date() };

      await (service as any).generateSeasonMissions(mockSeason);

      expect(missionServiceMock.createMission).not.toHaveBeenCalled();
    });
  });
});
