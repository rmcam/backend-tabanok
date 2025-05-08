import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationController } from './evaluation.controller';
import { EvaluationService } from './evaluation.service';

describe('EvaluationController', () => {
  let controller: EvaluationController;
  let service: EvaluationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluationController],
      providers: [
        {
          provide: EvaluationService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findByUserId: jest.fn(),
            findUserProgress: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EvaluationController>(EvaluationController);
    service = module.get<EvaluationService>(EvaluationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of evaluations', async () => {
      const result = [{ id: '1', score: 100 }]; // Mock the expected result
      jest.spyOn(service, 'findAll').mockImplementation(async () => result as any);

      expect(await controller.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single evaluation', async () => {
      const evaluationId = 'some-id';
      const result = { id: evaluationId, score: 100 }; // Mock the expected result
      jest.spyOn(service, 'findOne').mockImplementation(async () => result as any);

      expect(await controller.findOne(evaluationId)).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a new evaluation', async () => {
      const createEvaluationDto = { score: 90, userId: 'some-user-id' }; // Mock the DTO
      const result = { id: 'new-id', ...createEvaluationDto }; // Mock the expected result
      jest.spyOn(service, 'create').mockImplementation(async () => result as any);

      expect(await controller.create(createEvaluationDto as any)).toBe(result);
    });
  });

  describe('findByUserId', () => {
    it('should return an array of evaluations filtered by user ID', async () => {
      const userId = 'some-user-id';
      const result = [{ id: '1', score: 100, userId }]; // Mock the expected result
      jest.spyOn(service, 'findByUserId').mockImplementation(async () => result as any);

      expect(await controller.findByUserId(userId)).toBe(result);
    });
  });

  describe('getUserProgress', () => {
    it('should return user progress', async () => {
      const userId = 'some-user-id';
      const result = { completedEvaluations: 5, averageScore: 85 }; // Mock the expected result
      jest.spyOn(service, 'findUserProgress').mockImplementation(async () => result as any);

      expect(await controller.getUserProgress(userId)).toBe(result);
    });
  });
});
