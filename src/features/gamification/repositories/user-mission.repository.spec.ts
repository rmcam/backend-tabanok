import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserMissionRepository } from './user-mission.repository';
import { UserMission } from '../entities/user-mission.entity';

describe('UserMissionRepository', () => {
  let repository: UserMissionRepository;
  let mockUserMissionRepository: Partial<Repository<UserMission>>;

  beforeEach(async () => {
    mockUserMissionRepository = {
      // Mock methods used in UserMissionRepository if any custom methods exist
      // For a basic repository, we might just test instantiation or add mocks later
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserMissionRepository,
        {
          provide: getRepositoryToken(UserMission),
          useValue: mockUserMissionRepository,
        },
      ],
    }).compile();

    repository = module.get<UserMissionRepository>(UserMissionRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  // Add tests for any custom methods added to UserMissionRepository in the future
});
