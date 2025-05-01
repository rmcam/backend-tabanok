import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MissionTemplateRepository } from './mission-template.repository';
import { MissionTemplate } from '../entities/mission-template.entity';

describe('MissionTemplateRepository', () => {
  let repository: MissionTemplateRepository;
  let mockMissionTemplateRepository: Partial<Repository<MissionTemplate>>;

  beforeEach(async () => {
    mockMissionTemplateRepository = {
      // Mock methods used in MissionTemplateRepository if any custom methods exist
      // For a basic repository, we might just test instantiation or add mocks later
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionTemplateRepository,
        {
          provide: getRepositoryToken(MissionTemplate),
          useValue: mockMissionTemplateRepository,
        },
      ],
    }).compile();

    repository = module.get<MissionTemplateRepository>(MissionTemplateRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  // Add tests for any custom methods added to MissionTemplateRepository in the future
});
