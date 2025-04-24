import { Test, TestingModule } from '@nestjs/testing';
import { CulturalContentService } from './cultural-content.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CulturalContent } from './cultural-content.entity';
import { Repository } from 'typeorm';

describe('CulturalContentService', () => {
  let service: CulturalContentService;
  let repository: Repository<CulturalContent>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CulturalContentService,
        {
          provide: getRepositoryToken(CulturalContent),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CulturalContentService>(CulturalContentService);
    repository = module.get<Repository<CulturalContent>>(getRepositoryToken(CulturalContent));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create cultural content', async () => {
    const dto = { title: 'Test', description: 'Desc', category: 'general', content: 'Content' };
    const entity = { id: '1', ...dto };

    mockRepository.create.mockReturnValue(entity);
    mockRepository.save.mockResolvedValue(entity);

    const result = await service.create(dto as any);
    expect(result).toEqual(entity);
    expect(mockRepository.create).toHaveBeenCalledWith(dto);
    expect(mockRepository.save).toHaveBeenCalledWith(entity);
  });

  it('should find all cultural content', async () => {
    const entities = [{ id: '1' }, { id: '2' }];
    mockRepository.find.mockResolvedValue(entities);

    const result = await service.findAll({ skip: 0, take: 10 });
    expect(result).toEqual(entities);
    expect(mockRepository.find).toHaveBeenCalledWith({ skip: 0, take: 10 });
  });

  it('should find one cultural content by id', async () => {
    const entity = { id: '1' };
    mockRepository.findOne.mockResolvedValue(entity);

    const result = await service.findOne('1');
    expect(result).toEqual(entity);
    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should find by category', async () => {
    const entities = [{ id: '1' }];
    mockRepository.find.mockResolvedValue(entities);

    const result = await service.findByCategory('general');
    expect(result).toEqual(entities);
    expect(mockRepository.find).toHaveBeenCalledWith({ where: { category: 'general' } });
  });

  it('should update cultural content', async () => {
    const entity = { id: '1', title: 'Old' };
    const updated = { id: '1', title: 'New' };

    jest.spyOn(service, 'findOne').mockResolvedValue(entity as any);
    mockRepository.save.mockResolvedValue(updated);

    const result = await service.update('1', { title: 'New' } as any);
    expect(result).toEqual(updated);
    expect(mockRepository.save).toHaveBeenCalledWith({ ...entity, title: 'New' });
  });

  it('should remove cultural content', async () => {
    const entity = { id: '1' };
    jest.spyOn(service, 'findOne').mockResolvedValue(entity as any);
    mockRepository.remove.mockResolvedValue(entity);

    await service.remove('1');
    expect(mockRepository.remove).toHaveBeenCalledWith(entity);
  });
});
