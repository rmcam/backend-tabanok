import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLevelRepository } from './user-level.repository';
import { UserLevel } from '../entities/user-level.entity';

describe('UserLevelRepository', () => {
  let repository: UserLevelRepository;
  let mockUserLevelRepository: Partial<Repository<UserLevel>>;

  beforeEach(async () => {
    mockUserLevelRepository = {
      // Mock methods used in UserLevelRepository if any custom methods exist
      // For a basic repository, we might just test instantiation or add mocks later
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserLevelRepository,
        {
          provide: getRepositoryToken(UserLevel),
          useValue: mockUserLevelRepository,
        },
      ],
    }).compile();

    repository = module.get<UserLevelRepository>(UserLevelRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should return the injected repository', () => {
    expect(repository.repository).toBe(mockUserLevelRepository);
  });

  // Add tests for any custom methods added to UserLevelRepository in the future
});
