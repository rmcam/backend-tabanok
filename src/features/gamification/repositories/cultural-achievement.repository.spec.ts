import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CulturalAchievementRepository } from './cultural-achievement.repository';
import { CulturalAchievement } from '../entities/cultural-achievement.entity';

describe('CulturalAchievementRepository', () => {
  let repository: CulturalAchievementRepository;
  let mockRepository: Partial<Repository<CulturalAchievement>>;

  beforeEach(async () => {
    mockRepository = {
      // Mock methods used in CulturalAchievementRepository if any custom methods exist
      // For a basic repository, we might just test instantiation or add mocks later
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CulturalAchievementRepository,
        {
          provide: getRepositoryToken(CulturalAchievement),
          useValue: mockRepository,
        },
      ],
    }).compile();

    repository = module.get<CulturalAchievementRepository>(CulturalAchievementRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  // Add tests for any custom methods added to CulturalAchievementRepository in the future
});
