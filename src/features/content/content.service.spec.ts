import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContentService } from './content.service';
import { Content } from './entities/content.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { NotFoundException } from '@nestjs/common';
import { ContentRepository } from './content.repository';

describe('ContentService', () => {
  let service: ContentService;
  // No longer need to get the repository instance directly if mocking via token
  // let repository: ContentRepository;

  const createContentDto: CreateContentDto = {
    title: 'Test Content',
    description: 'Test Description',
    type: 'Test Type',
    unityId: 1,
    topicId: 1,
  };

  const updateContentDto: UpdateContentDto = {
    title: 'Updated Test Content',
    description: 'Updated Test Description',
    type: 'Updated Test Type',
    unityId: 2,
    topicId: 2,
  };

  const mockContent = {
    id: 99,
    title: 'Test Content',
    description: 'Test Description',
    type: 'Test Type',
    data: {},
    order: 1,
    isActive: true,
    level: 1,
    lessonId: 'test-lesson-id', // lessonId might still be a string based on entity definition
    unityId: 1,
    unity: null,
    topicId: 1,
    topic: null,
    multimedia: null,
    createdAt: new Date('2025-05-01T03:54:02.127Z'),
    updatedAt: new Date('2025-05-01T03:54:02.127Z'),
    lesson: null,
    versions: null,
    categories: [],
    tags: []
  } as unknown as Content;

  const mockContentInactive = {
    id: 98,
    title: 'Test Content',
    description: 'Test Description',
    type: 'Test Type',
    data: {},
    order: 1,
    isActive: false,
    level: 1,
    lessonId: 'test-lesson-id', // lessonId might still be a string based on entity definition
    unityId: 1,
    unity: null,
    topicId: 1,
    topic: null,
    multimedia: null,
    createdAt: new Date('2025-05-01T03:54:02.127Z'),
    updatedAt: new Date('2025-05-01T03:54:02.127Z'),
    lesson: null,
    versions: null,
    categories: [],
    tags: []
  } as unknown as Content;

  // Define the mock repository object
  const mockContentRepository = {
    create: jest.fn().mockReturnValue(mockContent),
    save: jest.fn().mockResolvedValue(mockContent),
    find: jest.fn().mockResolvedValue([mockContent]),
    findOne: jest.fn().mockResolvedValue(mockContent),
    merge: jest.fn().mockReturnValue(mockContent),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    findByUnityAndTopic: jest.fn().mockResolvedValue([mockContent]),
    // Add other methods used by the service if any
    // e.g., findOneBy, count, etc.
  };


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        {
          provide: getRepositoryToken(Content), // Provide mock for the Content entity's repository token
          useValue: mockContentRepository, // Use the mock object defined above
        },
        // If ContentRepository is injected directly by class, use this instead:
        // {
        //   provide: ContentRepository,
        //   useValue: mockContentRepository,
        // }
      ],
    })
    // Remove useMocker as we are providing the mock directly
    // .useMocker((token) => {
    //   if (token === ContentRepository) {
    //     return {
    //       create: jest.fn().mockReturnValue(mockContent),
    //       save: jest.fn().mockResolvedValue(mockContent),
    //       find: jest.fn().mockResolvedValue([mockContent]),
    //       findOne: jest.fn().mockResolvedValue(mockContent),
    //       merge: jest.fn().mockReturnValue(mockContent),
    //       delete: jest.fn().mockResolvedValue({ affected: 1 }),
    //       findByUnityAndTopic: jest.fn().mockResolvedValue([mockContent]),
    //     };
    //   }
    //   return {}; // Fallback for other dependencies
    // })
    .compile();

    service = module.get<ContentService>(ContentService);
    // Get the mock repository instance via its token
    // repository = module.get(getRepositoryToken(Content)); // No longer needed to get it in the test file

    // Mock findOne on the service for update/remove tests
    // This mock is redundant if the repository's findOne is correctly mocked
    // jest.spyOn(service, 'findOne').mockResolvedValue(mockContent as Content);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a content', async () => {
      const result = await service.create(createContentDto);
      // Expect calls on the mock repository object
      expect(mockContentRepository.create).toHaveBeenCalledWith(createContentDto);
      expect(mockContentRepository.save).toHaveBeenCalledWith(mockContent);
      expect(result).toEqual(mockContent);
    });
  });

  describe('findAll', () => {
    it('should return an array of content', async () => {
      const result = await service.findAll();
      // Expect calls on the mock repository object
      expect(mockContentRepository.find).toHaveBeenCalledWith();
      expect(result).toEqual([mockContent]);
    });
  });

  describe('findOne', () => {
    it('should return a content', async () => {
      const contentId = 99; // Use numeric ID
      const result = await service.findOne(contentId);
      // Expect calls on the mock repository object
      expect(mockContentRepository.findOne).toHaveBeenCalledWith({ where: { id: contentId } });
      expect(result).toEqual(mockContent);
    });

    it('should throw NotFoundException if content is not found', async () => {
      // Mock findOne specifically for this test case
      mockContentRepository.findOne.mockResolvedValueOnce(undefined);
      const contentId = 99; // Use numeric ID
      await expect(service.findOne(contentId)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a content', async () => {
      const contentId = 99; // Use numeric ID
      // Mock findOne on the mock repository for the service's update method to find the entity
      mockContentRepository.findOne.mockResolvedValueOnce(mockContent);
      const result = await service.update(contentId, updateContentDto);
      // Expect calls on the mock repository object
      expect(mockContentRepository.findOne).toHaveBeenCalledWith({ where: { id: contentId } });
      expect(mockContentRepository.merge).toHaveBeenCalledWith(mockContent, updateContentDto);
      expect(mockContentRepository.save).toHaveBeenCalledWith(mockContent);
      expect(result).toEqual(mockContent);
    });

    it('should throw NotFoundException if content is not found during update', async () => {
      const contentId = 99; // Use numeric ID
      // Mock findOne on the mock repository to return undefined
      mockContentRepository.findOne.mockResolvedValueOnce(undefined);
      await expect(service.update(contentId, updateContentDto)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a content', async () => {
      const contentId = 99; // Use numeric ID
      // Mock findOne on the mock repository for the service's remove method to find the entity
      mockContentRepository.findOne.mockResolvedValueOnce(mockContent);
      // Mock delete on the mock repository to indicate success
      mockContentRepository.delete.mockResolvedValueOnce({ affected: 1 });
      await service.remove(contentId);
      // Expect calls on the mock repository object
      expect(mockContentRepository.findOne).toHaveBeenCalledWith({ where: { id: contentId } });
      expect(mockContentRepository.delete).toHaveBeenCalledWith(contentId);
    });

    it('should throw NotFoundException if delete affected 0 rows', async () => {
      const contentId = 99; // Use numeric ID
      // Mock findOne on the mock repository to return the entity
      // This findOne mock is not strictly necessary for this test as remove doesn't call findOne,
      // but keeping it doesn't hurt and aligns with previous mocks.
      mockContentRepository.findOne.mockResolvedValueOnce(mockContent);
      // Mock delete on the mock repository to indicate no rows were affected
      mockContentRepository.delete.mockResolvedValueOnce({ affected: 0 });
      await expect(service.remove(contentId)).rejects.toThrowError(NotFoundException);
    });
  });

  describe('findByUnityAndTopic', () => {
    it('should return content by unity and topic', async () => {
      const unityId = 1; // Use numeric ID
      const topicId = 1; // Use numeric ID
      const result = await service.findByUnityAndTopic(unityId, topicId);
      // Expect calls on the mock repository object
      expect(mockContentRepository.findByUnityAndTopic).toHaveBeenCalledWith(unityId, topicId);
      expect(result).toEqual([mockContent]);
    });
  });
});
