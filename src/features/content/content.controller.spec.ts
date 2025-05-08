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
    content: {},
    order: 1,
    unityId: '1',
    topicId: '1',
  };

  const updateContentDto: UpdateContentDto = {
    title: 'Updated Test Content',
    description: 'Updated Test Description',
    type: 'Updated Test Type',
    content: {},
    order: 2,
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
            findByUnityAndTopic: jest.fn().mockResolvedValue([{ id: 'test-id', ...createContentDto }]),
            update: jest.fn().mockResolvedValue({ id: 'test-id', ...updateContentDto }),
            remove: jest.fn().mockResolvedValue(undefined),
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
      const result = await controller.findOne('123'); // Use a string for ID
      expect(service.findOne).toHaveBeenCalledWith(123); // Expect number ID
      expect(result).toEqual({ id: 'test-id', ...createContentDto });
    });
  });

  describe('findByUnityAndTopic', () => {
    it('should return content by unity and topic', async () => {
      const result = await controller.findByUnityAndTopic('123', '456'); // Use strings for IDs
      expect(service.findByUnityAndTopic).toHaveBeenCalledWith('123', '456'); // Expect string IDs
      expect(result).toEqual([{ id: 'test-id', ...createContentDto }]);
    });
  });

  describe('update', () => {
    it('should update a content', async () => {
      const result = await controller.update('123', updateContentDto); // Use a string for ID
      expect(service.update).toHaveBeenCalledWith(123, updateContentDto); // Expect number ID
      expect(result).toEqual({ id: 'test-id', ...updateContentDto });
    });
  });

  describe('remove', () => {
    it('should remove a content', async () => {
      await controller.remove('123'); // Use a string for ID
      expect(service.remove).toHaveBeenCalledWith(123); // Expect number ID
    });
  });
});
