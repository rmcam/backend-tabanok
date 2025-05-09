import { Test, TestingModule } from '@nestjs/testing';
import { GamificationController } from './gamification.controller';
import { GamificationService } from '../services/gamification.service';
import { LeaderboardService } from '../services/leaderboard.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { LeaderboardEntryDto } from '../dto/leaderboard-entry.dto';
import { User } from '../../../auth/entities/user.entity'; // Importar User entity para tipado

describe('GamificationController', () => {
  let controller: GamificationController;
  let gamificationService: GamificationService;
  let leaderboardService: LeaderboardService;

  // Definir los mocks con tipado explícito para jest.Mock
  const mockGamificationService = {
    grantPoints: jest.fn() as jest.Mock,
    assignMission: jest.fn() as jest.Mock,
    awardPoints: jest.fn() as jest.Mock, // Añadir mock para awardPoints
  };

  const mockLeaderboardService = {
    getLeaderboard: jest.fn() as jest.Mock,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamificationController],
      providers: [
        {
          provide: GamificationService,
          useValue: mockGamificationService,
        },
        {
          provide: LeaderboardService,
          useValue: mockLeaderboardService,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard) // Sobrescribir el guard JWT
    .useValue({ canActivate: () => true }) // Permitir siempre el acceso para pruebas de controlador
    .compile();

    controller = module.get<GamificationController>(GamificationController);
    gamificationService = module.get<GamificationService>(GamificationService);
    leaderboardService = module.get<LeaderboardService>(LeaderboardService);

    jest.clearAllMocks();

    // Configurar valores de retorno mockeados después de obtener las instancias
    // Usar 'as any' para evitar problemas de tipado estrictos en los mocks si es necesario
    mockGamificationService.grantPoints.mockResolvedValue({ id: 'some-user-id', points: 100, userMissions: [] } as any);
    mockGamificationService.assignMission.mockResolvedValue({ id: 'some-user-id', points: 0, userMissions: [{ id: 'some-user-mission-id', userId: 'some-user-id', missionId: 'some-mission-id' }] } as any);
    mockGamificationService.awardPoints.mockResolvedValue({ id: 'some-user-id', gameStats: { totalPoints: 100 } } as any); // Mockear awardPoints
    mockLeaderboardService.getLeaderboard.mockResolvedValue([
      { userId: 'user-id-1', username: 'user1', score: 1000, rank: 1 },
      { userId: 'user-id-2', username: 'user2', score: 800, rank: 2 },
    ] as LeaderboardEntryDto[]);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('grantPoints', () => {
    it('should grant points to a user', async () => {
      const userId = 1; // Usar number para la llamada al controlador
      const points = 100;
      // Mock de usuario actualizado para coincidir con el mock del servicio
      const expectedUser = { id: 'some-user-id', points: 100, userMissions: [] };

      // mockGamificationService.grantPoints.mockResolvedValue(expectedUser); // Configurado en beforeEach

      const result = await controller.grantPoints(userId, points);

      expect(result).toEqual({ id: 'some-user-id', gameStats: { totalPoints: 100 } }); // Expect the mocked return value of awardPoints
      expect(mockGamificationService.awardPoints).toHaveBeenCalledWith(userId, points, 'manual_points', 'Puntos otorgados manualmente'); // Check if awardPoints was called
    });

    it('should handle errors when granting points', async () => {
        const userId = 1; // Usar number para la llamada al controlador
        const points = 100;

        mockGamificationService.awardPoints.mockRejectedValue(new Error('Service error')); // Mock awardPoints to reject

        await expect(controller.grantPoints(userId, points)).rejects.toThrow('Service error');
        expect(mockGamificationService.awardPoints).toHaveBeenCalledWith(userId, points, 'manual_points', 'Puntos otorgados manualmente'); // Check if awardPoints was called
    });
  });

  describe('assignMission', () => {
    it('should assign a mission to a user', async () => {
      const userId = 1; // Usar number para la llamada al controlador
      const missionId = 1; // Usar number para la llamada al controlador
      // Mock de usuario actualizado para coincidir con el mock del servicio
      const expectedUser = { id: 'some-user-id', points: 0, userMissions: [{ id: 'some-user-mission-id', userId: 'some-user-id', missionId: 'some-mission-id' }] };

      // mockGamificationService.assignMission.mockResolvedValue(expectedUser); // Configurado en beforeEach

      const result = await controller.assignMission(userId, missionId);

      expect(result).toEqual(expectedUser);
      expect(mockGamificationService.assignMission).toHaveBeenCalledWith(userId, missionId);
    });

    it('should handle errors when assigning a mission', async () => {
        const userId = 1; // Usar number para la llamada al controlador
        const missionId = 1; // Usar number para la llamada al controlador

        mockGamificationService.assignMission.mockRejectedValue(new Error('Service error'));

        await expect(controller.assignMission(userId, missionId)).rejects.toThrow('Service error');
        expect(mockGamificationService.assignMission).toHaveBeenCalledWith(userId, missionId);
    });
  });

  describe('getLeaderboard', () => {
    it('should return the leaderboard', async () => {
      const expectedLeaderboard: LeaderboardEntryDto[] = [
        { userId: 'user-id-1', username: 'user1', score: 1000, rank: 1 }, // Usar score y username
        { userId: 'user-id-2', username: 'user2', score: 800, rank: 2 }, // Usar score y username
      ];

      // mockLeaderboardService.getLeaderboard.mockResolvedValue(expectedLeaderboard); // Configurado en beforeEach

      const result = await controller.getLeaderboard();

      expect(result).toEqual(expectedLeaderboard);
      expect(mockLeaderboardService.getLeaderboard).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on service error', async () => {
        mockLeaderboardService.getLeaderboard.mockRejectedValue(new Error('Database error')); // Usar el error directamente

        await expect(controller.getLeaderboard()).rejects.toThrow(InternalServerErrorException);
        expect(mockLeaderboardService.getLeaderboard).toHaveBeenCalled();
    });
  });
});
