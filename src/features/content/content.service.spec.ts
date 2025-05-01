import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentService } from './content.service';
import { Content } from './entities/content.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { NotFoundException } from '@nestjs/common';
import { ILike } from 'typeorm';

describe('ContentService', () => {
  let service: ContentService;
  let repository: Repository<Content>;

  const createContentDto: CreateContentDto = {
    title: 'Test Content',
    description: 'Test Description',
    type: 'Test Type',
    data: {},
    order: 1,
    isActive: true,
    level: 1,
    lessonId: 'test-lesson-id',
    categories: [],
    tags: []
  };

  const updateContentDto: UpdateContentDto = {
    title: 'Updated Test Content',
    description: 'Updated Test Description',
    type: 'Updated Test Type',
    data: {},
    order: 2,
    isActive: false,
    level: 2,
    categories: [],
    tags: []
  };

  const mockContent = {
    id: 'test-id',
    title: 'Test Content',
    description: 'Test Description',
    type: 'Test Type',
    data: {},
    order: 1,
    isActive: true,
    level: 1,
    lessonId: 'test-lesson-id',
    createdAt: new Date('2025-05-01T03:54:02.127Z'),
    updatedAt: new Date('2025-05-01T03:54:02.127Z'),
    lesson: null,
    versions: null,
    categories: [],
    tags: []
  };

  const mockContentInactive = {
    id: 'test-id',
    title: 'Test Content',
    description: 'Test Description',
    type: 'Test Type',
    data: {},
    order: 1,
    isActive: false,
    level: 1,
    lessonId: 'test-lesson-id',
    createdAt: new Date('2025-05-01T03:54:02.127Z'),
    updatedAt: new Date('2025-05-01T03:54:02.127Z'),
    lesson: null,
    versions: null,
    categories: [],
    tags: []
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        {
          provide: getRepositoryToken(Content),
          useValue: {
            create: jest.fn().mockResolvedValue(mockContent),
            save: jest.fn().mockImplementation((content) => Promise.resolve(content)),
            find: jest.fn().mockResolvedValue([mockContent]),
            findOne: jest.fn().mockResolvedValue(mockContent),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
            searchContent: jest.fn().mockResolvedValue([mockContent]),
          },
        },
      ],
    }).compile();

    service = module.get<ContentService>(ContentService);
    repository = module.get<Repository<Content>>(getRepositoryToken(Content));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a content', async () => {
      const result = await service.create(createContentDto);
      expect(repository.create).toHaveBeenCalledWith(createContentDto);
      expect(await repository.save(mockContent)).toEqual(mockContent);
      expect(result).toEqual(mockContent);
    });
  });

  describe('findAll', () => {
    it('should return an array of content', async () => {
      const result = await service.findAll();
      expect(repository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        relations: ['lesson'],
        order: { order: 'ASC' },
      });
      expect(result).toEqual([mockContent]);
    });
  });

  describe('findOne', () => {
    it('should return a content', async () => {
      const result = await service.findOne('test-id');
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-id', isActive: true },
        relations: ['lesson'],
      });
      expect(result).toEqual(mockContent);
    });

    it('should throw NotFoundException if content is not found', async () => {
      jest.spyOn(repository, 'findOne').mockResolvedValue(undefined);
      await expect(service.findOne('test-id')).rejects.toThrowError(NotFoundException);
    });
  });

  describe('findByLesson', () => {
    it('should return content by lesson', async () => {
      const result = await service.findByLesson('test-lesson-id');
      expect(repository.find).toHaveBeenCalledWith({
        where: { lessonId: 'test-lesson-id', isActive: true },
        relations: ['lesson'],
        order: { order: 'ASC' },
      });
      expect(result).toEqual([mockContent]);
    });
  });

  describe('update', () => {
    it('should update a content', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockContent);
      const result = await service.update('test-id', updateContentDto);
      expect(service.findOne).toHaveBeenCalledWith('test-id');
      expect(await repository.save({
        id: 'test-id',
        title: 'Updated Test Content',
        description: 'Updated Test Description',
        type: 'Updated Test Type',
        data: {},
        order: 2,
        isActive: false,
        level: 2,
        lessonId: 'test-lesson-id',
        createdAt: new Date('2025-05-01T03:54:02.127Z'),
        updatedAt: new Date('2025-05-01T03:54:02.127Z'),
        lesson: null,
        versions: null,
        categories: [],
        tags: []
      })).toEqual(mockContent);
      expect(result).toEqual(mockContent);
    });
  });

  describe('remove', () => {
    it('should remove a content', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockContentInactive);
      await service.remove('test-id');
      expect(service.findOne).toHaveBeenCalledWith('test-id');
      expect(repository.save).toHaveBeenCalledWith(mockContentInactive);
    });
  });

  describe('searchContent', () => {
    it('should search content', async () => {
      const result = await service.searchContent('test');
      expect(repository.find).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual([mockContent]);
    });
  });
});
