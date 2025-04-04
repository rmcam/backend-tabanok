import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaderboardService } from '../../../../src/features/gamification/services/leaderboard.service';
import { Leaderboard } from '../../../../src/features/gamification/entities/leaderboard.entity';
import { LeaderboardCategory, LeaderboardType } from '../../../../src/features/gamification/enums/leaderboard.enum';
import { Gamification } from '../../../../src/features/gamification/entities/gamification.entity';
import { LeaderboardRepository } from '../../../../src/features/gamification/repositories/leaderboard.repository'; // Importar el repositorio personalizado

// Definir un tipo para el mock del repositorio personalizado
type MockRepository<T = any> = Partial<Record<keyof T, jest.Mock>>;

describe('LeaderboardService', () => {
  let service: LeaderboardService;
  let leaderboardRepository: MockRepository<LeaderboardRepository>; // Usar el tipo MockRepository
  let gamificationRepository: MockRepository<Repository<Gamification>>; // Usar el tipo MockRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardService,
        {
          provide: LeaderboardRepository, // Proveer el repositorio personalizado
          useValue: { // Mockear los métodos usados por el servicio
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findActiveByTypeAndCategory: jest.fn(),
            updateUserRanking: jest.fn(),
            calculateRanks: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Gamification), // Mantener el mock para el repositorio estándar
          useValue: {
            find: jest.fn().mockResolvedValue([{user: {id: '1', firstName: 'Test', lastName: 'User'}}]),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LeaderboardService>(LeaderboardService);
    // Obtener la instancia del mock del repositorio personalizado
    leaderboardRepository = module.get<MockRepository<LeaderboardRepository>>(
      LeaderboardRepository,
    );
    // Obtener la instancia del mock del repositorio estándar
    gamificationRepository = module.get<MockRepository<Repository<Gamification>>>(
      getRepositoryToken(Gamification),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateLeaderboards', () => {
    it('should call all update methods', async () => {
      const spyDaily = jest.spyOn(service as any, 'updateDailyLeaderboards');
      const spyWeekly = jest.spyOn(service as any, 'updateWeeklyLeaderboards');
      const spyMonthly = jest.spyOn(service as any, 'updateMonthlyLeaderboards');
      const spyAllTime = jest.spyOn(service as any, 'updateAllTimeLeaderboards');

      await service.updateLeaderboards();

      expect(spyDaily).toHaveBeenCalled();
      expect(spyWeekly).toHaveBeenCalled();
      expect(spyMonthly).toHaveBeenCalled();
      expect(spyAllTime).toHaveBeenCalled();
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard for given type and category', async () => {
      const mockLeaderboard = {
        type: LeaderboardType.DAILY,
        category: LeaderboardCategory.POINTS,
        rankings: [],
      } as Leaderboard;

      // Usar el método mockeado directamente
      leaderboardRepository.findActiveByTypeAndCategory.mockResolvedValue(mockLeaderboard);

      const result = await service.getLeaderboard(
        LeaderboardType.DAILY,
        LeaderboardCategory.POINTS,
      );

      expect(result).toEqual(mockLeaderboard);
      // Verificar que el método mockeado fue llamado con los argumentos correctos
      expect(leaderboardRepository.findActiveByTypeAndCategory).toHaveBeenCalledWith(
        LeaderboardType.DAILY,
        LeaderboardCategory.POINTS,
      );
    });

    it('should return null if no leaderboard found', async () => {
      // Usar el método mockeado directamente
      leaderboardRepository.findActiveByTypeAndCategory.mockResolvedValue(null);

      const result = await service.getLeaderboard(
        LeaderboardType.DAILY,
        LeaderboardCategory.POINTS,
      );

      expect(result).toBeNull();
    });

    it('should throw error for invalid type', async () => {
      leaderboardRepository.findActiveByTypeAndCategory.mockResolvedValue(null);
      await expect(service.getLeaderboard(
        'INVALID_TYPE' as LeaderboardType,
        LeaderboardCategory.POINTS
      )).rejects.toThrow();
    });

    it('should throw error for invalid category', async () => {
      leaderboardRepository.findActiveByTypeAndCategory.mockResolvedValue(null);
      await expect(service.getLeaderboard(
        LeaderboardType.DAILY,
        'INVALID_CATEGORY' as LeaderboardCategory
      )).rejects.toThrow();
    });
  });

  describe('getUserRank', () => {
    it('should return user rank and total', async () => {
      const mockLeaderboard = {
        rankings: [
          { userId: '1', rank: 1 },
          { userId: '2', rank: 2 },
        ],
      } as Leaderboard;

      // Usar el método mockeado directamente
      leaderboardRepository.findActiveByTypeAndCategory.mockResolvedValue(mockLeaderboard);

      const result = await service.getUserRank(
        '1',
        LeaderboardType.DAILY,
        LeaderboardCategory.POINTS,
      );

      expect(result).toEqual({ rank: 1, total: 2 });
    });

    it('should return rank 0 if user not found', async () => {
      const mockLeaderboard = {
        rankings: [{ userId: '2', rank: 1 }],
      } as Leaderboard;

      // Usar el método mockeado directamente
      leaderboardRepository.findActiveByTypeAndCategory.mockResolvedValue(mockLeaderboard);

      const result = await service.getUserRank(
        '1',
        LeaderboardType.DAILY,
        LeaderboardCategory.POINTS,
      );

      expect(result).toEqual({ rank: 0, total: 1 });
    });

    it('should handle empty rankings', async () => {
      const mockLeaderboard = {
        rankings: [],
      } as Leaderboard;

      // Usar el método mockeado directamente
      leaderboardRepository.findActiveByTypeAndCategory.mockResolvedValue(mockLeaderboard);

      const result = await service.getUserRank(
        '1',
        LeaderboardType.DAILY,
        LeaderboardCategory.POINTS,
      );

      expect(result).toEqual({ rank: 0, total: 0 });
    });

    it('should handle multiple users with same points', async () => {
      const mockLeaderboard = {
        rankings: [
          { userId: '1', rank: 1 },
          { userId: '2', rank: 1 }, // Same rank
          { userId: '3', rank: 2 },
        ],
      } as Leaderboard;

      // Usar el método mockeado directamente
      leaderboardRepository.findActiveByTypeAndCategory.mockResolvedValue(mockLeaderboard);

      const result = await service.getUserRank(
        '2',
        LeaderboardType.DAILY,
        LeaderboardCategory.POINTS,
      );

      expect(result).toEqual({ rank: 1, total: 3 });
    });
  });

  describe('updateUserRank', () => {
    it('should update user rankings', async () => {
      const mockGamification = {
        user: { id: '1', firstName: 'Test', lastName: 'User' },
        points: 100,
        stats: {},
        achievements: [],
      } as Gamification;

      const mockLeaderboard = {
        id: '1',
        type: LeaderboardType.DAILY,
        category: LeaderboardCategory.POINTS,
        startDate: new Date(),
        endDate: new Date(),
        rankings: [],
      } as Leaderboard;

      // Mockear los métodos necesarios
      gamificationRepository.findOne.mockResolvedValue(mockGamification);
      leaderboardRepository.find.mockResolvedValue([mockLeaderboard]);
      leaderboardRepository.updateUserRanking.mockResolvedValue(undefined); // Simula la actualización
      leaderboardRepository.calculateRanks.mockResolvedValue(undefined); // Simula el cálculo

      await service.updateUserRank('1');

      // Verificar llamadas a los mocks
      expect(gamificationRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: '1' } },
        relations: ['user', 'achievements'],
      });
      expect(leaderboardRepository.find).toHaveBeenCalled();
      expect(leaderboardRepository.updateUserRanking).toHaveBeenCalledWith(
        mockLeaderboard.id,
        '1',
        100, // score
        [], // achievements
      );
      expect(leaderboardRepository.calculateRanks).toHaveBeenCalledWith(mockLeaderboard.id);
    });

    it('should do nothing if gamification not found', async () => {
      // Mockear findOne para que devuelva null
      gamificationRepository.findOne.mockResolvedValue(null);

      await service.updateUserRank('1');

      // Verificar que findOne fue llamado
      expect(gamificationRepository.findOne).toHaveBeenCalledWith({
        where: { user: { id: '1' } },
        relations: ['user', 'achievements'],
      });
      // Verificar que los otros métodos no fueron llamados
      expect(leaderboardRepository.find).not.toHaveBeenCalled();
      expect(leaderboardRepository.updateUserRanking).not.toHaveBeenCalled();
      expect(leaderboardRepository.calculateRanks).not.toHaveBeenCalled();
    });
  });

  describe('Private Methods', () => {
    describe('updateDailyLeaderboards', () => {
      it('should update daily leaderboards', async () => {
        const mockLeaderboard = {
          id: '1',
          type: LeaderboardType.DAILY,
          category: LeaderboardCategory.POINTS,
          startDate: new Date(),
          endDate: new Date(),
          rankings: [],
          rewards: [], // Añadir propiedad faltante
          user: undefined, // Añadir propiedad faltante (puede ser undefined si no es relevante)
          createdAt: new Date(), // Añadir propiedad faltante
          lastUpdated: new Date(), // Añadir propiedad faltante
          save: jest.fn(),
        } as Leaderboard;

        // Mockear findOne para devolver el leaderboard existente o null si no existe
        leaderboardRepository.findOne.mockResolvedValue(mockLeaderboard);
        // Mockear find para devolver los datos de gamification
        gamificationRepository.find.mockResolvedValue([]);
        // Mockear save para simular el guardado
        leaderboardRepository.save.mockResolvedValue(mockLeaderboard);

        await (service as any).updateDailyLeaderboards();

        // Verificar que findOne fue llamado para buscar el leaderboard
        expect(leaderboardRepository.findOne).toHaveBeenCalled();
        // Verificar que gamificationRepository.find fue llamado para calcular rankings
        expect(gamificationRepository.find).toHaveBeenCalled();
        // Verificar que save fue llamado para guardar el leaderboard actualizado
        expect(leaderboardRepository.save).toHaveBeenCalled();
      });
    });

    describe('updateWeeklyLeaderboards', () => {
      it('should update weekly leaderboards', async () => {
        const mockLeaderboard = {
          id: '1',
          type: LeaderboardType.WEEKLY,
          category: LeaderboardCategory.POINTS,
          startDate: new Date(),
          endDate: new Date(),
          rankings: [],
          rewards: [], // Añadir propiedad faltante
          user: undefined, // Añadir propiedad faltante
          createdAt: new Date(), // Añadir propiedad faltante
          lastUpdated: new Date(), // Añadir propiedad faltante
        } as Leaderboard;

        leaderboardRepository.findOne.mockResolvedValue(mockLeaderboard);
        gamificationRepository.find.mockResolvedValue([]);
        leaderboardRepository.save.mockResolvedValue(mockLeaderboard);

        await (service as any).updateWeeklyLeaderboards();

        expect(leaderboardRepository.findOne).toHaveBeenCalled();
        expect(gamificationRepository.find).toHaveBeenCalled();
        expect(leaderboardRepository.save).toHaveBeenCalled();
      });
    });

    describe('updateMonthlyLeaderboards', () => {
      it('should update monthly leaderboards', async () => {
        const mockLeaderboard = {
          id: '1',
          type: LeaderboardType.MONTHLY,
          category: LeaderboardCategory.POINTS,
          startDate: new Date(),
          endDate: new Date(),
          rankings: [],
          rewards: [], // Añadir propiedad faltante
          user: undefined, // Añadir propiedad faltante
          createdAt: new Date(), // Añadir propiedad faltante
          lastUpdated: new Date(), // Añadir propiedad faltante
        } as Leaderboard;

        leaderboardRepository.findOne.mockResolvedValue(mockLeaderboard);
        gamificationRepository.find.mockResolvedValue([]);
        leaderboardRepository.save.mockResolvedValue(mockLeaderboard);

        await (service as any).updateMonthlyLeaderboards();

        expect(leaderboardRepository.findOne).toHaveBeenCalled();
        expect(gamificationRepository.find).toHaveBeenCalled();
        expect(leaderboardRepository.save).toHaveBeenCalled();
      });
    });

    describe('updateAllTimeLeaderboards', () => {
      it('should update all-time leaderboards', async () => {
        const mockLeaderboard = {
          id: '1',
          type: LeaderboardType.ALL_TIME,
          category: LeaderboardCategory.POINTS,
          startDate: new Date(),
          endDate: new Date(),
          rankings: [],
          rewards: [], // Añadir propiedad faltante
          user: undefined, // Añadir propiedad faltante
          createdAt: new Date(), // Añadir propiedad faltante
          lastUpdated: new Date(), // Añadir propiedad faltante
        } as Leaderboard;

        leaderboardRepository.findOne.mockResolvedValue(mockLeaderboard);
        gamificationRepository.find.mockResolvedValue([]);
        leaderboardRepository.save.mockResolvedValue(mockLeaderboard);

        await (service as any).updateAllTimeLeaderboards();

        expect(leaderboardRepository.findOne).toHaveBeenCalled();
        expect(gamificationRepository.find).toHaveBeenCalled();
        expect(leaderboardRepository.save).toHaveBeenCalled();
      });
    });
  });
});
