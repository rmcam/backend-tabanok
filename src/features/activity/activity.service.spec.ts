import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from '../topic/entities/topic.entity';
import { ActivityService } from './activity.service';
import { Activity, ActivityType } from './entities/activity.entity';

describe('ActivityService', () => {
  let service: ActivityService;
  let activityRepository: Repository<Activity>;
  let topicRepository: Repository<Topic>;

  const mockActivity = {
    id: '1',
    title: 'Test Activity',
    type: ActivityType.VOCABULARY_QUIZ,
    content: {
      questions: [
        {
          question: '¿Cómo se dice "casa" en Kamëntsá?',
          options: ['yebna', 'bëng', 'tsok'],
          correctAnswer: 'yebna',
          points: 10,
        },
      ],
    },
    difficultyLevel: 1,
    pointsToEarn: 10,
    isActive: true,
    topic: { id: '1', name: 'Test Topic' },
  };

  const mockTopic = {
    id: '1',
    name: 'Test Topic',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivityService,
        {
          provide: getRepositoryToken(Activity),
          useValue: {
            create: jest.fn().mockReturnValue(mockActivity),
            save: jest.fn().mockResolvedValue(mockActivity),
            find: jest.fn().mockResolvedValue([mockActivity]),
            findOne: jest.fn().mockResolvedValue(mockActivity),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([mockActivity]),
            })),
          },
        },
        {
          provide: getRepositoryToken(Topic),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockTopic),
          },
        },
      ],
    }).compile();

    service = module.get<ActivityService>(ActivityService);
    activityRepository = module.get<Repository<Activity>>(
      getRepositoryToken(Activity),
    );
    topicRepository = module.get<Repository<Topic>>(getRepositoryToken(Topic));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an activity', async () => {
      const createActivityDto = {
        title: 'Test Activity',
        type: ActivityType.VOCABULARY_QUIZ,
        content: mockActivity.content,
        difficultyLevel: 1,
        pointsToEarn: 10,
        topicId: '1',
      };

      const result = await service.create(createActivityDto);
      expect(result).toEqual(mockActivity);
    });

    it('should throw NotFoundException if topic not found', async () => {
      jest.spyOn(topicRepository, 'findOne').mockResolvedValue(null);

      const createActivityDto = {
        title: 'Test Activity',
        type: ActivityType.VOCABULARY_QUIZ,
        content: mockActivity.content,
        difficultyLevel: 1,
        pointsToEarn: 10,
        topicId: '1',
      };

      await expect(service.create(createActivityDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of activities', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockActivity]);
    });
  });

  describe('findOne', () => {
    it('should return an activity', async () => {
      const result = await service.findOne('1');
      expect(result).toEqual(mockActivity);
    });

    it('should throw NotFoundException if activity not found', async () => {
      jest.spyOn(activityRepository, 'findOne').mockResolvedValue(null);
      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateAnswer', () => {
    it('should validate correct answer', async () => {
      const result = await service.validateAnswer('1', 0, 'yebna');
      expect(result).toEqual({
        correct: true,
        points: 10,
        correctAnswer: undefined,
      });
    });

    it('should validate incorrect answer', async () => {
      const result = await service.validateAnswer('1', 0, 'wrong');
      expect(result).toEqual({
        correct: false,
        points: 0,
        correctAnswer: 'yebna',
      });
    });

    it('should throw error for invalid activity type', async () => {
      jest.spyOn(activityRepository, 'findOne').mockResolvedValue({
        ...mockActivity,
        type: ActivityType.MEMORY_GAME,
      });

      await expect(service.validateAnswer('1', 0, 'test')).rejects.toThrow(
        'This activity type does not support answer validation',
      );
    });
  });

  describe('getRandomActivities', () => {
    it('should return random activities', async () => {
      const result = await service.getRandomActivities(5);
      expect(result).toEqual([mockActivity]);
    });

    it('should filter by type and difficulty level', async () => {
      const result = await service.getRandomActivities(
        5,
        ActivityType.VOCABULARY_QUIZ,
        1,
      );
      expect(result).toEqual([mockActivity]);
    });
  });
}); 