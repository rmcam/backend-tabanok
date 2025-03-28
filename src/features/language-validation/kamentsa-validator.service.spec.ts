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

    describe('validateText', () => {
        it('debería validar texto con caracteres especiales correctos', () => {
            const text = 'Bëngbe Bëtsa';
            const result = service.validateText(text);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('debería detectar caracteres especiales incorrectos', () => {
            const text = 'Bengbe Betsa';
            const result = service.validateText(text);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0].type).toBe('SPELLING');
        });

        it('debería generar sugerencias para caracteres incorrectos', () => {
            const text = 'Bengbe';
            const result = service.validateText(text);
            expect(result.suggestions.length).toBeGreaterThan(0);
            expect(result.suggestions[0].original).toBe('e');
            expect(result.suggestions[0].suggested).toBe('ë');
        });
    });

    describe('validateWord', () => {
        it('debería validar verbos con sufijo correcto', () => {
            const word = 'jatëmbna';
            const result = service.validateWord(word);
            expect(result.isValid).toBe(true);
        });

        it('debería detectar verbos sin sufijo correcto', () => {
            const word = 'jatëmb';
            const result = service.validateWord(word);
            expect(result.isValid).toBe(false);
            expect(result.errors[0].type).toBe('GRAMMAR');
        });
    });

    describe('normalizeText', () => {
        it('debería normalizar caracteres especiales', () => {
            const text = 'Bengbe Betsa';
            const normalized = service.normalizeText(text);
            expect(normalized).toBe('Bëngbe Bëtsa');
        });

        it('debería mantener el texto sin cambios si ya está normalizado', () => {
            const text = 'Bëngbe Bëtsa';
            const normalized = service.normalizeText(text);
            expect(normalized).toBe(text);
        });
    });

    describe('getCharacterInfo', () => {
        it('debería retornar información de un carácter especial', () => {
            const info = service.getCharacterInfo('ë');
            expect(info).toBeDefined();
            expect(info?.character).toBe('ë');
            expect(info?.type).toBe('VOWEL');
        });

        it('debería retornar null para caracteres no especiales', () => {
            const info = service.getCharacterInfo('a');
            expect(info).toBeNull();
        });
    });

    describe('getSuggestions', () => {
        it('debería generar sugerencias para texto con errores', () => {
            const text = 'Bengbe Betsa jatemb';
            const suggestions = service.getSuggestions(text);
            expect(suggestions.length).toBeGreaterThan(0);
            suggestions.forEach(suggestion => {
                expect(suggestion).toHaveProperty('original');
                expect(suggestion).toHaveProperty('suggested');
                expect(suggestion).toHaveProperty('reason');
                expect(suggestion).toHaveProperty('confidence');
            });
        });

        it('debería retornar un array vacío para texto correcto', () => {
            const text = 'Bëngbe Bëtsa jatëmbna';
            const suggestions = service.getSuggestions(text);
            expect(suggestions).toHaveLength(0);
        });
    });
}); 