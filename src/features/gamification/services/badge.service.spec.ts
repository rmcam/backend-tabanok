import { Test, TestingModule } from '@nestjs/testing';
import { BadgeService } from './badge.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from '../entities/badge.entity';
import { UserBadge } from '../entities/user-badge.entity';

describe('BadgeService', () => {
  let service: BadgeService;
  let badgeRepository: Repository<Badge>;
  let userBadgeRepository: Repository<UserBadge>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BadgeService,
        {
          provide: getRepositoryToken(Badge),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(UserBadge),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<BadgeService>(BadgeService);
    badgeRepository = module.get<Repository<Badge>>(getRepositoryToken(Badge));
    userBadgeRepository = module.get<Repository<UserBadge>>(getRepositoryToken(UserBadge));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBadgesByUserId', () => {
    it('should return badges for a given user ID', async () => {
      const userId = 'test-user-id';
      const mockBadges: Badge[] = [
        {
          id: 'badge-1',
          name: 'Badge 1',
          description: 'Desc 1',
          category: 'general',
          tier: 'bronze',
          requiredPoints: 10,
          iconUrl: 'icon1.png',
          requirements: {},
          isSpecial: false,
          expirationDate: null,
          timesAwarded: 0,
          benefits: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Badge,
        {
          id: 'badge-2',
          name: 'Badge 2',
          description: 'Desc 2',
          category: 'general',
          tier: 'silver',
          requiredPoints: 50,
          iconUrl: 'icon2.png',
          requirements: {},
          isSpecial: false,
          expirationDate: null,
          timesAwarded: 0,
          benefits: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Badge,
      ];
      const mockUserBadges: UserBadge[] = [
        { userId: userId, badge: mockBadges[0] } as UserBadge,
        { userId: userId, badge: mockBadges[1] } as UserBadge,
      ];

      jest.spyOn(userBadgeRepository, 'find').mockResolvedValue(mockUserBadges);

      const result = await service.getBadgesByUserId(userId);

      expect(result).toEqual(mockBadges);
      expect(userBadgeRepository.find).toHaveBeenCalledWith({
        where: { userId: userId },
        relations: ['badge'],
      });
    });
  });
});
