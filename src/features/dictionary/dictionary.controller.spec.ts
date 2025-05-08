import { Test, TestingModule } from '@nestjs/testing';
import { DictionaryController } from './dictionary.controller';
import { DictionaryService } from '@/features/dictionary/dictionary.service';
import { KamentsaValidatorService } from '../language-validation/kamentsa-validator.service';

describe('DictionaryController', () => {
  let controller: DictionaryController;
  let dictionaryService: DictionaryService;
  let kamentsaValidatorService: KamentsaValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DictionaryController],
      providers: [
        {
          provide: DictionaryService,
          useValue: {
            // Mock methods of DictionaryService here
          },
        },
        {
          provide: KamentsaValidatorService,
          useValue: {
            // Mock methods of KamentsaValidatorService here
            normalizeText: jest.fn(),
            dictionary: [], // Mock the dictionary property
          },
        },
      ],
    }).compile();

    controller = module.get<DictionaryController>(DictionaryController);
    dictionaryService = module.get<DictionaryService>(DictionaryService);
    kamentsaValidatorService = module.get<KamentsaValidatorService>(KamentsaValidatorService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('search', () => {
    it('should return a dictionary entry if found', async () => {
      const query = 'test';
      const normalizedQuery = 'normalized_test';
      const mockDictionary = [{ entrada: 'test', significados: [{ definicion: 'a test' }] }];
      const expectedEntry = { entry: mockDictionary[0] };

      jest.spyOn(kamentsaValidatorService, 'normalizeText').mockReturnValue(normalizedQuery);
      (kamentsaValidatorService as any).dictionary = mockDictionary; // Assign mock dictionary

      const result = await controller.search(query);

      expect(kamentsaValidatorService.normalizeText).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedEntry);
    });

    it('should return null if no dictionary entry is found', async () => {
      const query = 'nonexistent';
      const normalizedQuery = 'normalized_nonexistent';
      const mockDictionary: any[] = []; // Empty dictionary

      jest.spyOn(kamentsaValidatorService, 'normalizeText').mockReturnValue(normalizedQuery);
      (kamentsaValidatorService as any).dictionary = mockDictionary; // Assign mock dictionary

      const result = await controller.search(query);

      expect(kamentsaValidatorService.normalizeText).toHaveBeenCalledWith(query);
      expect(result).toEqual({ entry: null });
    });
  });
});
