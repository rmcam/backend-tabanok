import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamificationRepository } from './gamification.repository';
import { Gamification } from '../entities/gamification.entity';

describe('GamificationRepository', () => {
  let repository: GamificationRepository;
  let mockTypeOrmRepository: MockRepository;

  // Mock TypeORM Repository
  type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

  const createMockRepository = <T>(): MockRepository<T> => ({
    findOne: jest.fn(),
    save: jest.fn(),
    // Add other methods if used in the repository
  });

  beforeEach(async () => {
    mockTypeOrmRepository = createMockRepository<Gamification>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationRepository,
        {
          provide: getRepositoryToken(Gamification),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<GamificationRepository>(GamificationRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findOne', () => {
    it('should call findOne on the TypeORM repository with the correct userId', async () => {
      const userId = 'test-user-id';
      const expectedGamification = new Gamification(); // Create a mock Gamification entity
      mockTypeOrmRepository.findOne.mockResolvedValue(expectedGamification);

      const result = await repository.findOne(userId);

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { userId } });
      expect(result).toEqual(expectedGamification);
    });

    it('should return undefined if gamification is not found', async () => {
      const userId = 'non-existent-user-id';
      mockTypeOrmRepository.findOne.mockResolvedValue(undefined);

      const result = await repository.findOne(userId);

      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({ where: { userId } });
      expect(result).toBeUndefined();
    });
  });

  describe('save', () => {
    it('should call save on the TypeORM repository with the provided gamification entity', async () => {
      const gamificationToSave = new Gamification(); // Create a mock Gamification entity
      const expectedGamification = { ...gamificationToSave, id: 'saved-id' };
      mockTypeOrmRepository.save.mockResolvedValue(expectedGamification);

      const result = await repository.save(gamificationToSave);

      expect(mockTypeOrmRepository.save).toHaveBeenCalledWith(gamificationToSave);
      expect(result).toEqual(expectedGamification);
    });
  });
});
