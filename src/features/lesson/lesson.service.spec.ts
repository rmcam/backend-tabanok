import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonService } from './lesson.service';
import { Lesson } from './entities/lesson.entity';
import { NotFoundException } from '@nestjs/common';

describe('LessonService', () => {
  let service: LessonService;
  let lessonRepository: Repository<Lesson>;

  const LESSON_REPOSITORY_TOKEN = getRepositoryToken(Lesson);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonService,
        {
          provide: LESSON_REPOSITORY_TOKEN,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LessonService>(LessonService);
    lessonRepository = module.get<Repository<Lesson>>(LESSON_REPOSITORY_TOKEN);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUnity', () => {
    it('should return active lessons for a given unityId, ordered and with relations', async () => {
      const unityId = 'some-unity-id';
      const mockLessons: Lesson[] = [
        {
          id: 'lesson1',
          title: 'Lesson 1',
          description: 'Description for lesson 1',
          order: 1,
          isLocked: false,
          isCompleted: false,
          isFeatured: false,
          requiredPoints: 0,
          isActive: true,
          unityId,
          unity: null, // Mockear la relación unity
          exercises: [],
          multimedia: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          generateId: jest.fn(), // Mockear el método generateId
        },
        {
          id: 'lesson2',
          title: 'Lesson 2',
          description: 'Description for lesson 2',
          order: 2,
          isLocked: false,
          isCompleted: false,
          isFeatured: false,
          requiredPoints: 0,
          isActive: true,
          unityId,
          unity: null, // Mockear la relación unity
          exercises: [],
          multimedia: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          generateId: jest.fn(), // Mockear el método generateId
        },
      ];

      jest.spyOn(lessonRepository, 'find').mockResolvedValue(mockLessons);

      const result = await service.findByUnity(unityId);

      expect(lessonRepository.find).toHaveBeenCalledWith({
        where: { unityId, isActive: true },
        order: { order: 'ASC' },
        relations: ['multimedia', 'exercises'],
      });
      expect(result).toEqual(mockLessons);
    });

    it('should return an empty array if no active lessons are found for the given unityId', async () => {
      const unityId = 'non-existent-unity-id';
      jest.spyOn(lessonRepository, 'find').mockResolvedValue([]);

      const result = await service.findByUnity(unityId);

      expect(lessonRepository.find).toHaveBeenCalledWith({
        where: { unityId, isActive: true },
        order: { order: 'ASC' },
        relations: ['multimedia', 'exercises'],
      });
      expect(result).toEqual([]);
    });
  });
});
