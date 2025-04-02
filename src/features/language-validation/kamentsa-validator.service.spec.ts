import { Test, TestingModule } from '@nestjs/testing';
import { KamentsaValidatorService } from './kamentsa-validator.service';

describe('KamentsaValidatorService', () => {
  let service: KamentsaValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KamentsaValidatorService],
    }).compile();

    service = module.get<KamentsaValidatorService>(KamentsaValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateText', () => {
    it('should return isValid true for a valid Kamëntsá word', async () => {
      const result = await service.validateText('ts̈ëngbe');
      expect(result.isValid).toBe(true);
    });

    it('should return isValid false for an invalid Kamëntsá word', async () => {
      const result = await service.validateText('tsengbe');
      expect(result.isValid).toBe(false);
    });

    it('should return errors if special characters are not used correctly', async () => {
      const result = await service.validateText('tsengbe');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return suggestions if special characters are not used correctly', async () => {
      const result = await service.validateText('tsengbe');
      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('validateSpecialCharacters', () => {
    it('should return an error if a special character is not used correctly', async () => {
      const errors = await service.validateSpecialCharacters('tsengbe');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should not return an error if a special character is used correctly', async () => {
      const errors = await service.validateSpecialCharacters('ts̈ëngbe');
      expect(errors.length).toBe(0);
    });
  });

  describe('validateGrammar', () => {
    it('should return an error if a grammatical rule is not followed', async () => {
      const errors = await service.validateGrammar('invalidword');
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should not return an error if a grammatical rule is followed', async () => {
      const errors = await service.validateGrammar('ts̈ëngbe');
      expect(errors.length).toBe(0);
    });
  });

  describe('normalizeText', () => {
    it('should normalize text with special characters', () => {
      const normalized = service.normalizeText('tsengbe');
      expect(normalized).toBe('ts̈ëngbe');
    });
  });

  describe('getCharacterInfo', () => {
    it('should return character info for a special character', () => {
      const info = service.getCharacterInfo('ë');
      expect(info).not.toBeNull();
      expect(info?.isSpecial).toBe(true);
    });

    it('should return null for a non-special character', () => {
      const info = service.getCharacterInfo('a');
      expect(info).toBeNull();
    });
  });
});
