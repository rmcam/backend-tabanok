import { Test, TestingModule } from '@nestjs/testing';
import { BadgeController } from './badge.controller';
import { BadgeService } from '../services/badge.service';
import { Badge } from '../entities/badge.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard'; // Importar el guard

describe('BadgeController', () => {
  let controller: BadgeController;
  let service: BadgeService;

  const mockBadgeService = {
    getBadgesByUserId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BadgeController],
      providers: [
        {
          provide: BadgeService,
          useValue: mockBadgeService,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard) // Sobrescribir el guard para evitar la autenticación real en las pruebas unitarias del controlador
    .useValue({ canActivate: () => true }) // Permitir siempre el acceso
    .compile();

    controller = module.get<BadgeController>(BadgeController);
    service = module.get<BadgeService>(BadgeService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBadgesByUserId', () => {
    it('should return an array of badges for a user', async () => {
      const userId = 'test-user-id';
      const expectedBadges: Badge[] = [
        { id: 'badge1', name: 'Badge 1', description: 'Desc 1', category: 'test', tier: 'bronze', requiredPoints: 10, iconUrl: 'icon1.png', requirements: {}, isSpecial: false, expirationDate: null, timesAwarded: 0, benefits: [], createdAt: new Date(), updatedAt: new Date() },
        { id: 'badge2', name: 'Badge 2', description: 'Desc 2', category: 'test', tier: 'silver', requiredPoints: 50, iconUrl: 'icon2.png', requirements: {}, isSpecial: false, expirationDate: null, timesAwarded: 0, benefits: [], createdAt: new Date(), updatedAt: new Date() },
      ];

      mockBadgeService.getBadgesByUserId.mockResolvedValue(expectedBadges);

      const result = await controller.getBadgesByUserId(userId);

      expect(result).toEqual(expectedBadges);
      expect(mockBadgeService.getBadgesByUserId).toHaveBeenCalledWith(userId);
    });
  });
});
