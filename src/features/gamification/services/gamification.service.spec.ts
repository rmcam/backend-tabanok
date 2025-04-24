import { Test, TestingModule } from '@nestjs/testing';
import { GamificationModule } from '../gamification.module';
import { GamificationService } from './gamification.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Reward } from '../entities/reward.entity';
import { User } from '../../../auth/entities/user.entity';
import { Level } from '../entities/level.entity';
import { UserAchievement } from '../entities/user-achievement.entity';
import { Repository } from 'typeorm';
import { UserRole, UserStatus } from '../../../auth/enums/auth.enum';

const mockRewardRepository = () => ({
  find: jest.fn(),
});

const mockUserRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

const mockUserAchievementRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
});

const mockLevelRepository = () => ({
  find: jest.fn(),
});

describe('GamificationService', () => {
  let service: GamificationService;
  let rewardRepository: MockType<Repository<Reward>>;
  let userRepository: MockType<Repository<User>>;
  let userAchievementRepository: MockType<Repository<UserAchievement>>;
  let levelRepository: MockType<Repository<Level>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [GamificationModule],
      providers: [
        GamificationService,
        { provide: getRepositoryToken(Reward), useFactory: mockRewardRepository },
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: getRepositoryToken(UserAchievement), useFactory: mockUserAchievementRepository },
      ],
    }).compile();

    service = module.get<GamificationService>(GamificationService);
    rewardRepository = module.get(getRepositoryToken(Reward));
    userRepository = module.get(getRepositoryToken(User));
    userAchievementRepository = module.get(getRepositoryToken(UserAchievement));
    levelRepository = module.get(getRepositoryToken(Level));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('grantPoints', () => {
    it('should grant points to a user and update their level', async () => {
      // Arrange
      const userId = 1;
      const points = 100;
      const initialPoints = 0;
      const level1 = { id: 1, level: 1, requiredXp: 0 };
      const level2 = { id: 2, level: 2, requiredXp: 100 };
      const user = {
        id: 'uuid',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: [],
        preferences: { notifications: false, language: 'es', theme: 'light' },
        culturalPoints: 0,
        gameStats: { totalPoints: initialPoints, level: 1, lessonsCompleted: 0, exercisesCompleted: 0, perfectScores: 0 },
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      (userRepository.findOne as jest.Mock).mockReturnValue(user);
      (levelRepository.find as jest.Mock).mockReturnValue([level1, level2]);
      (userRepository.save as jest.Mock).mockReturnValue({ ...user, gameStats: { totalPoints: initialPoints + points, level: 2, lessonsCompleted: 0, exercisesCompleted: 0, perfectScores: 0 } });

      // Act
      const result = await service.grantPoints(userId, points);

      // Assert
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId.toString() } });
      expect(levelRepository.find).toHaveBeenCalledWith({ order: { requiredXp: 'ASC' } });
      expect(userRepository.save).toHaveBeenCalledWith({ ...user, gameStats: { totalPoints: initialPoints + points, level: 2, lessonsCompleted: 0, exercisesCompleted: 0, perfectScores: 0 } });
      expect(result.gameStats.totalPoints).toEqual(initialPoints + points);
      expect(result.gameStats.level).toEqual(2);
    });
  });
});

type MockType<T> = {
  [P in keyof T]?: jest.Mock<any, any>;
};
