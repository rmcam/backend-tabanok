import { Test, TestingModule } from '@nestjs/testing';
import { MissionTemplateService } from './mission-template.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MissionTemplate } from '../entities/mission-template.entity';

describe('MissionTemplateService', () => {
  let service: MissionTemplateService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      // Mock methods used by the service
      create: jest.fn(dto => dto),
      save: jest.fn(mission => Promise.resolve(mission)),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionTemplateService,
        {
          provide: getRepositoryToken(MissionTemplate),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MissionTemplateService>(MissionTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
