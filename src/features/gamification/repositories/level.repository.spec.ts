import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LevelRepository } from './level.repository';
import { UserLevel } from '../entities/user-level.entity';

describe('LevelRepository', () => {
  let repository: LevelRepository;
  let mockRepository: Partial<Repository<UserLevel>>;
  let mockDataSource: Partial<DataSource>;

  beforeEach(async () => {
    mockRepository = {
      // Mock methods used in LevelRepository if any custom methods exist
    };

    mockDataSource = {
        manager: { // Mock the manager property
            getRepository: () => mockRepository as Repository<UserLevel>,
        } as any, // Cast to any to satisfy type requirements for testing
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LevelRepository,
        {
          provide: getRepositoryToken(UserLevel),
          useValue: mockRepository,
        },
        {
            provide: DataSource, // Correctly provide the DataSource class
            useValue: mockDataSource,
        }
      ],
    }).compile();

    repository = module.get<LevelRepository>(LevelRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  // Add tests for any custom methods added to LevelRepository in the future
});
