import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { UserAchievementRepository } from './user-achievement.repository';
import { UserAchievement } from '../entities/user-achievement.entity';

describe('UserAchievementRepository', () => {
  let repository: UserAchievementRepository;
  let mockRepository: Partial<Repository<UserAchievement>>;
  let mockDataSource: Partial<DataSource>;
  let mockEntityManager: Partial<EntityManager>;

  beforeEach(async () => {
    mockRepository = {
      // Mock methods used in UserAchievementRepository if any custom methods exist
    };

    mockEntityManager = {
        getRepository: () => mockRepository as any, // Cast to any to bypass strict type checking for the mock
    };

    mockDataSource = {
        createEntityManager: () => mockEntityManager as EntityManager,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAchievementRepository,
        {
          provide: getRepositoryToken(UserAchievement),
          useValue: mockRepository,
        },
        {
            provide: DataSource,
            useValue: mockDataSource,
        }
      ],
    }).compile();

    repository = module.get<UserAchievementRepository>(UserAchievementRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  // Add tests for any custom methods added to UserAchievementRepository in the future
});
