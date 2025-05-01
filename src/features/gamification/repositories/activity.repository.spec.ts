import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityRepository } from './activity.repository';
import { UserActivity } from '../entities/activity.entity';

describe('ActivityRepository', () => {
  let repository: ActivityRepository;
  let mockRepository: Partial<Repository<UserActivity>>;

  beforeEach(async () => {
    mockRepository = {
      // Mock methods used in ActivityRepository if any custom methods exist
      // For a basic repository, we might just test instantiation or add mocks later
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityRepository,
        {
          provide: getRepositoryToken(UserActivity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<ActivityRepository>(ActivityRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  // Add tests for any custom methods added to ActivityRepository in the future
});
