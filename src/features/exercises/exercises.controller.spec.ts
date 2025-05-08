import { Test, TestingModule } from '@nestjs/testing';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';

describe('ExercisesController', () => {
  let controller: ExercisesController;
  let service: ExercisesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExercisesController],
      providers: [
        {
          provide: ExercisesService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ExercisesController>(ExercisesController);
    service = module.get<ExercisesService>(ExercisesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of exercises', async () => {
      const result = [{ id: '1', name: 'Exercise 1' }]; // Mock the expected result
      jest.spyOn(service, 'findAll').mockImplementation(async () => result as any);

      expect(await controller.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single exercise', async () => {
      const exerciseId = 'some-id';
      const result = { id: exerciseId, name: 'Test Exercise' }; // Mock the expected result
      jest.spyOn(service, 'findOne').mockImplementation(async () => result as any);

      expect(await controller.findOne(exerciseId)).toBe(result);
    });
  });

  describe('create', () => {
    it('should create a new exercise', async () => {
      const createExerciseDto = { name: 'New Exercise', type: 'quiz' }; // Mock the DTO
      const result = { id: 'new-id', ...createExerciseDto }; // Mock the expected result
      jest.spyOn(service, 'create').mockImplementation(async () => result as any);

      expect(await controller.create(createExerciseDto as any)).toBe(result);
    });
  });

  describe('update', () => {
    it('should update an existing exercise', async () => {
      const exerciseId = 'some-id';
      const updateExerciseDto = { name: 'Updated Exercise' }; // Mock the DTO
      const result = { id: exerciseId, ...updateExerciseDto }; // Mock the expected result
      jest.spyOn(service, 'update').mockImplementation(async () => result as any);

      expect(await controller.update(exerciseId, updateExerciseDto as any)).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove an exercise', async () => {
      const exerciseId = 'some-id';
      jest.spyOn(service, 'remove').mockImplementation(async () => undefined as any); // Mock the expected result

      expect(await controller.remove(exerciseId)).toBeUndefined();
    });
  });
});
