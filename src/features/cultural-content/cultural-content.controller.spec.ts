import { Test, TestingModule } from '@nestjs/testing';
import { CulturalContentController } from './cultural-content.controller';
import { CulturalContentService } from './cultural-content.service';

describe('CulturalContentController', () => {
  let controller: CulturalContentController;
  let service: CulturalContentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CulturalContentController],
      providers: [
        {
          provide: CulturalContentService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByCategory: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CulturalContentController>(CulturalContentController);
    service = module.get<CulturalContentService>(CulturalContentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of cultural content', async () => {
      const result = [{ id: '1', title: 'Content 1' }]; // Mock the expected result
      jest.spyOn(service, 'findAll').mockImplementation(async () => result as any);

      expect(await controller.findAll(0, 10)).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single cultural content', async () => {
      const contentId = 'some-id';
      const result = { id: contentId, title: 'Test Content' }; // Mock the expected result
      jest.spyOn(service, 'findOne').mockImplementation(async () => result as any);

      expect(await controller.findOne(contentId)).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a new cultural content', async () => {
      const createCulturalContentDto = { title: 'New Content', category: 'some-category' }; // Mock the DTO
      const result = { id: 'new-id', ...createCulturalContentDto }; // Mock the expected result
      jest.spyOn(service, 'create').mockImplementation(async () => result as any);

      expect(await controller.create(createCulturalContentDto as any)).toBe(result);
    });
  });

  describe('update', () => {
    it('should update an existing cultural content', async () => {
      const contentId = 'some-id';
      const updateCulturalContentDto = { title: 'Updated Content' }; // Mock the DTO
      const result = { id: contentId, ...updateCulturalContentDto }; // Mock the expected result
      jest.spyOn(service, 'update').mockImplementation(async () => result as any);

      expect(await controller.update(contentId, updateCulturalContentDto as any)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a cultural content', async () => {
      const contentId = 'some-id';
      jest.spyOn(service, 'remove').mockImplementation(async () => undefined as any); // Mock the expected result

      expect(await controller.remove(contentId)).toBeUndefined();
    });
  });

  describe('findByCategory', () => {
    it('should return an array of cultural content filtered by category', async () => {
      const category = 'some-category';
      const result = [{ id: '1', title: 'Content 1', category }]; // Mock the expected result
      jest.spyOn(service, 'findByCategory').mockImplementation(async () => result as any);

      expect(await controller.findByCategory(category)).toBe(result);
    });
  });
});
