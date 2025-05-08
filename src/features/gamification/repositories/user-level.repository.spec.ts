import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; // Importar DataSource
import { UserLevelRepository } from './user-level.repository';
import { UserLevel } from '../entities/user-level.entity';

describe('UserLevelRepository', () => {
  let repository: UserLevelRepository;
  let mockUserLevelRepository: Partial<Repository<UserLevel>>;
  let mockDataSource: Partial<DataSource>; // Declarar mock para DataSource

  beforeEach(async () => {
    mockUserLevelRepository = {
      // Mock methods used in UserLevelRepository if any custom methods exist
      // For a basic repository, we might just test instantiation or add mocks later
    };

    mockDataSource = { // Mock para DataSource
      createEntityManager: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserLevelRepository,
        {
          provide: getRepositoryToken(UserLevel),
          useValue: mockUserLevelRepository,
        },
        {
          provide: DataSource, // Proveer mock para DataSource
          useValue: mockDataSource,
        },
      ],
    }).compile();

    repository = module.get<UserLevelRepository>(UserLevelRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  // it('should return the injected repository', () => {
  //   expect(repository.repository).toBe(mockUserLevelRepository);
  // });

  // Add tests for any custom methods added to UserLevelRepository in the future
});
