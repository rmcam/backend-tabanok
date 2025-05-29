import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonService } from './lesson.service';
import { Lesson } from './entities/lesson.entity';
import { Exercise } from '../exercises/entities/exercise.entity'; // Asumiendo la ruta correcta para Exercise

describe('LessonService', () => {
  let service: LessonService;
  let lessonRepository: Repository<Lesson>;

  const mockLessonRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonService,
        {
          provide: getRepositoryToken(Lesson),
          useValue: mockLessonRepository,
        },
      ],
    }).compile();

    service = module.get<LessonService>(LessonService);
    lessonRepository = module.get<Repository<Lesson>>(getRepositoryToken(Lesson));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUnity', () => {
    it('should return active lessons with exercises for a given unityId', async () => {
      const unityId = 'some-unity-id';
      const mockLessons: Lesson[] = [
        {
          id: 'lesson1',
          title: 'Lesson 1',
          description: 'Description for Lesson 1',
          unityId: unityId,
          isActive: true,
          isLocked: false,
          isCompleted: false,
          order: 1,
          requiredPoints: 10,
          exercises: [{
            id: 'exercise1',
            title: 'Exercise 1',
            description: 'Description for Exercise 1',
            type: 'quiz',
            content: {},
            difficulty: 'easy',
            points: 5,
            timeLimit: 0,
            isActive: true,
            topicId: 'some-topic-id',
            topic: null, // Mock as null or a partial Topic object if needed
            tags: [],
            timesCompleted: 0,
            averageScore: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            lesson: null, // Will be set by relation
            progress: null, // Will be set by relation
          } as Exercise],
          multimedia: [],
          isFeatured: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          unity: null, // Mock as null or a partial Unity object if needed
        } as Lesson, // Cast to Lesson to satisfy type checking
        {
          id: 'lesson2',
          title: 'Lesson 2',
          description: 'Description for Lesson 2',
          unityId: unityId,
          isActive: true,
          isLocked: false,
          isCompleted: false,
          order: 2,
          requiredPoints: 15,
          exercises: [{
            id: 'exercise2',
            title: 'Exercise 2',
            description: 'Description for Exercise 2',
            type: 'fill-in-the-blanks',
            content: {},
            difficulty: 'medium',
            points: 8,
            timeLimit: 0,
            isActive: true,
            topicId: 'some-topic-id',
            topic: null,
            tags: [],
            timesCompleted: 0,
            averageScore: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            lesson: null,
            progress: null,
          } as Exercise],
          multimedia: [],
          isFeatured: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          unity: null,
        } as Lesson, // Cast to Lesson to satisfy type checking
      ];

      mockLessonRepository.find.mockResolvedValue(mockLessons);

      const result = await service.findByUnity(unityId);

      expect(lessonRepository.find).toHaveBeenCalledWith({
        where: { unityId, isActive: true },
        order: { order: 'ASC' },
        relations: ['exercises'],
      });
      expect(result).toEqual(mockLessons);
      expect(result.length).toBe(2);
      expect(result[0].exercises).toBeDefined();
      expect(result[0].exercises.length).toBeGreaterThan(0);
    });

    it('should return an empty array if no active lessons are found for the unityId', async () => {
      const unityId = 'non-existent-unity-id';
      mockLessonRepository.find.mockResolvedValue([]);

      const result = await service.findByUnity(unityId);

      expect(lessonRepository.find).toHaveBeenCalledWith({
        where: { unityId, isActive: true },
        order: { order: 'ASC' },
        relations: ['exercises'],
      });
      expect(result).toEqual([]);
    });

    it('should not return inactive lessons', async () => {
      const unityId = 'some-unity-id';
      const mockLessons: Lesson[] = [
        {
          id: 'lesson3',
          title: 'Lesson 3',
          description: 'Description for Lesson 3',
          unityId: unityId,
          isActive: false, // Inactive lesson
          isLocked: false,
          isCompleted: false,
          order: 3,
          requiredPoints: 20,
          exercises: [],
          multimedia: [],
          isFeatured: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          unity: null,
        } as Lesson, // Cast to Lesson to satisfy type checking
      ];

      mockLessonRepository.find.mockResolvedValue([]); // Should return empty because isActive: false

      const result = await service.findByUnity(unityId);

      expect(lessonRepository.find).toHaveBeenCalledWith({
        where: { unityId, isActive: true },
        order: { order: 'ASC' },
        relations: ['exercises'],
      });
      expect(result).toEqual([]);
    });
  });
});
