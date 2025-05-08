import { Test, TestingModule } from '@nestjs/testing';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';

describe('ActivityController', () => {
  let controller: ActivityController;
  let service: ActivityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [
        {
          provide: ActivityService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findByType: jest.fn(),
            findByDifficulty: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            updatePoints: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ActivityController>(ActivityController);
    service = module.get<ActivityService>(ActivityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of activities', async () => {
      const result = [{ id: '1', name: 'Activity 1' }]; // Mock the expected result
      jest.spyOn(service, 'findAll').mockImplementation(async () => result as any);

      expect(await controller.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single activity', async () => {
      const activityId = 'some-id';
      const result = { id: activityId, name: 'Test Activity' }; // Mock the expected result
      jest.spyOn(service, 'findOne').mockImplementation(async () => result as any);

      expect(await controller.findOne(activityId)).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a new activity', async () => {
      const createActivityDto = { name: 'New Activity', type: 'quiz', difficulty: 'easy' }; // Mock the DTO
      const result = { id: 'new-id', ...createActivityDto }; // Mock the expected result
      jest.spyOn(service, 'create').mockImplementation(async () => result as any);

      expect(await controller.create(createActivityDto as any)).toBe(result);
    });
  });

  describe('update', () => {
    it('should update an existing activity', async () => {
      const activityId = 'some-id';
      const updateActivityDto = { name: 'Updated Activity' }; // Mock the DTO
      const result = { id: activityId, ...updateActivityDto }; // Mock the expected result
      jest.spyOn(service, 'update').mockImplementation(async () => result as any);

      expect(await controller.update(activityId, updateActivityDto as any)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove an activity', async () => {
      const activityId = 'some-id';
      jest.spyOn(service, 'remove').mockImplementation(async () => undefined as any); // Mock the expected result

      expect(await controller.remove(activityId)).toBeUndefined();
    });
  });

  describe('findByType', () => {
    it('should return an array of activities filtered by type', async () => {
      const activityType = 'quiz';
      const result = [{ id: '1', name: 'Quiz Activity', type: activityType }]; // Mock the expected result
      jest.spyOn(service, 'findByType').mockImplementation(async () => result as any);

      expect(await controller.findByType(activityType as any)).toBe(result);
    });
  });

  describe('findByDifficulty', () => {
    it('should return an array of activities filtered by difficulty', async () => {
      const difficultyLevel = 'easy';
      const result = [{ id: '1', name: 'Easy Activity', difficulty: difficultyLevel }]; // Mock the expected result
      jest.spyOn(service, 'findByDifficulty').mockImplementation(async () => result as any);

      expect(await controller.findByDifficulty(difficultyLevel as any)).toBe(result);
    });
  });

  describe('updatePoints', () => {
    it('should update activity points', async () => {
      const activityId = 'some-id';
      const points = 100; // Mock the points value
      const result = { id: activityId, points }; // Mock the expected result
      jest.spyOn(service, 'updatePoints').mockImplementation(async () => result as any);

      expect(await controller.updatePoints(activityId, points)).toBe(result);
    });
  });
});
