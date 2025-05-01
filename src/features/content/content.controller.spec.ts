import { Test, TestingModule } from '@nestjs/testing';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { UserRole } from '../../auth/entities/user.entity';

describe('ContentController', () => {
  let controller: ContentController;
  let service: ContentService;

  const createContentDto: CreateContentDto = {
    title: 'Test Content',
    description: 'Test Description',
    type: 'Test Type',
    data: {},
    order: 1,
    isActive: true,
    level: 1,
    lessonId: 'test-lesson-id',
  };

  const updateContentDto: UpdateContentDto = {
    title: 'Updated Test Content',
    description: 'Updated Test Description',
    type: 'Updated Test Type',
    data: {},
    order: 2,
    isActive: false,
    level: 2,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentController],
      providers: [
        {
          provide: ContentService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 'test-id', ...createContentDto }),
            findAll: jest.fn().mockResolvedValue([{ id: 'test-id', ...createContentDto }]),
            findOne: jest.fn().mockResolvedValue({ id: 'test-id', ...createContentDto }),
            findByLesson: jest.fn().mockResolvedValue([{ id: 'test-id', ...createContentDto }]),
            update: jest.fn().mockResolvedValue({ id: 'test-id', ...updateContentDto }),
            remove: jest.fn().mockResolvedValue(undefined),
            searchContent: jest.fn().mockResolvedValue([{ id: 'test-id', ...createContentDto }]),
          },
        },
      ],
    }).compile();

    controller = module.get<ContentController>(ContentController);
    service = module.get<ContentService>(ContentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a content', async () => {
      const result = await controller.create(createContentDto);
      expect(service.create).toHaveBeenCalledWith(createContentDto);
      expect(result).toEqual({ id: 'test-id', ...createContentDto });
    });
  });

  describe('findAll', () => {
    it('should return an array of content', async () => {
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'test-id', ...createContentDto }]);
    });
  });

  describe('findOne', () => {
    it('should return a content', async () => {
      const result = await controller.findOne('test-id');
      expect(service.findOne).toHaveBeenCalledWith('test-id');
      expect(result).toEqual({ id: 'test-id', ...createContentDto });
    });
  });

  describe('findByLesson', () => {
    it('should return content by lesson', async () => {
      const result = await controller.findByLesson('test-lesson-id');
      expect(service.findByLesson).toHaveBeenCalledWith('test-lesson-id');
      expect(result).toEqual([{ id: 'test-id', ...createContentDto }]);
    });
  });

  describe('update', () => {
    it('should update a content', async () => {
      const result = await controller.update('test-id', updateContentDto);
      expect(service.update).toHaveBeenCalledWith('test-id', updateContentDto);
      expect(result).toEqual({ id: 'test-id', ...updateContentDto });
    });
  });

  describe('remove', () => {
    it('should remove a content', async () => {
      await controller.remove('test-id');
      expect(service.remove).toHaveBeenCalledWith('test-id');
    });
  });

  describe('searchContent', () => {
    it('should search content', async () => {
      const result = await controller.searchContent('test');
      expect(service.searchContent).toHaveBeenCalledWith('test');
      expect(result).toEqual([{ id: 'test-id', ...createContentDto }]);
    });
  });
});
