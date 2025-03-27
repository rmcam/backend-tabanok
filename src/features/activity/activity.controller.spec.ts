import { Test, TestingModule } from '@nestjs/testing';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { ActivityType } from './entities/activity.entity';

// Mock de los guards
const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };
const mockRolesGuard = { canActivate: jest.fn(() => true) };

jest.mock('../../auth/guards/jwt-auth.guard', () => ({
  JwtAuthGuard: jest.fn().mockImplementation(() => mockJwtAuthGuard),
}));

jest.mock('../../auth/guards/roles.guard', () => ({
  RolesGuard: jest.fn().mockImplementation(() => mockRolesGuard),
}));

describe('ActivityController', () => {
  let controller: ActivityController;
  let service: ActivityService;

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

  const mockActivityService = {
    create: jest.fn().mockResolvedValue(mockActivity),
    findAll: jest.fn().mockResolvedValue([mockActivity]),
    findOne: jest.fn().mockResolvedValue(mockActivity),
    update: jest.fn().mockResolvedValue(mockActivity),
    remove: jest.fn().mockResolvedValue(undefined),
    findByType: jest.fn().mockResolvedValue([mockActivity]),
    findByTopic: jest.fn().mockResolvedValue([mockActivity]),
    findByDifficultyLevel: jest.fn().mockResolvedValue([mockActivity]),
    getRandomActivities: jest.fn().mockResolvedValue([mockActivity]),
    validateAnswer: jest.fn().mockResolvedValue({
      correct: true,
      points: 10,
      correctAnswer: undefined,
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [
        {
          provide: ActivityService,
          useValue: mockActivityService,
        },
      ],
    }).compile();

    controller = module.get<ActivityController>(ActivityController);
    service = module.get<ActivityService>(ActivityService);

    // Resetear los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      const result = await controller.create(createActivityDto);
      expect(result).toEqual(mockActivity);
      expect(service.create).toHaveBeenCalledWith(createActivityDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of activities', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockActivity]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return an activity', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(mockActivity);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('findByType', () => {
    it('should return activities by type', async () => {
      const result = await controller.findByType(ActivityType.VOCABULARY_QUIZ);
      expect(result).toEqual([mockActivity]);
      expect(service.findByType).toHaveBeenCalledWith(
        ActivityType.VOCABULARY_QUIZ,
      );
    });
  });

  describe('findByTopic', () => {
    it('should return activities by topic', async () => {
      const result = await controller.findByTopic('1');
      expect(result).toEqual([mockActivity]);
      expect(service.findByTopic).toHaveBeenCalledWith('1');
    });
  });

  describe('findByDifficultyLevel', () => {
    it('should return activities by difficulty level', async () => {
      const result = await controller.findByDifficultyLevel(1);
      expect(result).toEqual([mockActivity]);
      expect(service.findByDifficultyLevel).toHaveBeenCalledWith(1);
    });
  });

  describe('getRandomActivities', () => {
    it('should return random activities', async () => {
      const result = await controller.getRandomActivities(5);
      expect(result).toEqual([mockActivity]);
      expect(service.getRandomActivities).toHaveBeenCalledWith(5, undefined, undefined);
    });

    it('should return filtered random activities', async () => {
      const result = await controller.getRandomActivities(
        5,
        ActivityType.VOCABULARY_QUIZ,
        1,
      );
      expect(result).toEqual([mockActivity]);
      expect(service.getRandomActivities).toHaveBeenCalledWith(
        5,
        ActivityType.VOCABULARY_QUIZ,
        1,
      );
    });
  });

  describe('validateAnswer', () => {
    it('should validate answer', async () => {
      const result = await controller.validateAnswer('1', {
        questionIndex: 0,
        answer: 'yebna',
      });
      expect(result).toEqual({
        correct: true,
        points: 10,
        correctAnswer: undefined,
      });
      expect(service.validateAnswer).toHaveBeenCalledWith('1', 0, 'yebna');
    });
  });
}); 