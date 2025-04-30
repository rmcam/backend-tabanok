import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationController } from './recommendation.controller';
import { RecommendationService } from '../services/recommendation.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard'; // Importar el guard
import { NotFoundException } from '@nestjs/common';

describe('RecommendationController', () => {
  let controller: RecommendationController;
  let service: RecommendationService;

  const mockRecommendationService = {
    getRecommendationsByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommendationController],
      providers: [
        {
          provide: RecommendationService,
          useValue: mockRecommendationService,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard) // Sobrescribir el guard para evitar la autenticación real en las pruebas unitarias del controlador
    .useValue({ canActivate: () => true }) // Permitir siempre el acceso
    .compile();

    controller = module.get<RecommendationController>(RecommendationController);
    service = module.get<RecommendationService>(RecommendationService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRecommendationsByUserId', () => {
    it('should return recommendations for a user', async () => {
      const userId = 'test-user-id';
      const expectedRecommendations = [{ id: 'rec1', content: 'Recommended content' }]; // Mock de recomendaciones

      mockRecommendationService.getRecommendationsByUserId.mockResolvedValue(expectedRecommendations);

      const result = await controller.getRecommendationsByUserId(userId);

      expect(result).toEqual(expectedRecommendations);
      expect(mockRecommendationService.getRecommendationsByUserId).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user not found', async () => {
        const userId = 'non-existent-user';

        mockRecommendationService.getRecommendationsByUserId.mockRejectedValue(new NotFoundException());

        await expect(controller.getRecommendationsByUserId(userId)).rejects.toThrow(NotFoundException);
        expect(mockRecommendationService.getRecommendationsByUserId).toHaveBeenCalledWith(userId);
    });
  });
});
