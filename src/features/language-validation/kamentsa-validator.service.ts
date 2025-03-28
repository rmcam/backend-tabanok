import { Injectable } from '@nestjs/common';
import {
    GrammaticalRule,
    KamentsaCharacter,
    KamentsaCharacterType,
    KamentsaValidator,
    ValidationError,
    ValidationResult,
    ValidationSuggestion
} from './interfaces/kamentsa-validator.interface';

@Injectable()
export class KamentsaValidatorService implements KamentsaValidator {
    private readonly specialCharacters: KamentsaCharacter[] = [
        {
            character: 'ë',
            type: KamentsaCharacterType.VOWEL,
            description: 'Vocal e con diéresis, sonido específico del Kamëntsá',
            variants: ['e', 'ê']
        },
        // Agregar más caracteres especiales según sea necesario
    ];

    private readonly grammaticalRules: GrammaticalRule[] = [
        {
            id: 'VERB_SUFFIX',
            description: 'Los verbos en Kamëntsá generalmente terminan en -na',
            pattern: /\w+na\b/,
            errorMessage: 'Este verbo podría necesitar el sufijo -na',
            examples: {
                correct: ['jatëmbna', 'jontsäna'],
                incorrect: ['jatëmb', 'jontsä']
            }
        },
        // Agregar más reglas gramaticales según sea necesario
    ];

    validateText(text: string): ValidationResult {
        const errors: ValidationError[] = [];
        const suggestions: ValidationSuggestion[] = [];

        // Validar caracteres especiales
        const specialCharErrors = this.validateSpecialCharacters(text);
        errors.push(...specialCharErrors);

        // Validar reglas gramaticales
        const grammarErrors = this.validateGrammar(text);
        errors.push(...grammarErrors);

        // Generar sugerencias
        if (errors.length > 0) {
            suggestions.push(...this.generateSuggestions(text, errors));
        }

        return {
            isValid: errors.length === 0,
            errors,
            suggestions
        };
    }

    validateWord(word: string): ValidationResult {
        return this.validateText(word);
    }

    validateSentence(sentence: string): ValidationResult {
        return this.validateText(sentence);
    }

    normalizeText(text: string): string {
        let normalized = text;

        // Normalizar caracteres especiales
        this.specialCharacters.forEach(char => {
            if (char.variants) {
                char.variants.forEach(variant => {
                    normalized = normalized.replace(
                        new RegExp(variant, 'g'),
                        char.character
                    );
                });
            }
        });

        return normalized;
    }

    getSuggestions(text: string): ValidationSuggestion[] {
        const result = this.validateText(text);
        return result.suggestions;
    }

    getCharacterInfo(char: string): KamentsaCharacter | null {
        return this.specialCharacters.find(
            specialChar => specialChar.character === char
        ) || null;
    }

    private validateSpecialCharacters(text: string): ValidationError[] {
        const errors: ValidationError[] = [];

        this.specialCharacters.forEach(specialChar => {
            if (specialChar.variants) {
                specialChar.variants.forEach(variant => {
                    const regex = new RegExp(variant, 'g');
                    let match;

                    while ((match = regex.exec(text)) !== null) {
                        errors.push({
                            type: 'SPELLING',
                            message: `Se recomienda usar '${specialChar.character}' en lugar de '${variant}'`,
                            position: {
                                start: match.index,
                                end: match.index + variant.length
                            }
                        });
                    }
                });
            }
        });

        return errors;
    }

    private validateGrammar(text: string): ValidationError[] {
        const errors: ValidationError[] = [];

        this.grammaticalRules.forEach(rule => {
            if (!rule.pattern.test(text)) {
                errors.push({
                    type: 'GRAMMAR',
                    message: rule.errorMessage,
                    position: {
                        start: 0,
                        end: text.length
                    },
                    rule
                });
            }
        });

        return errors;
    }

    private generateSuggestions(text: string, errors: ValidationError[]): ValidationSuggestion[] {
        const suggestions: ValidationSuggestion[] = [];

        errors.forEach(error => {
            if (error.type === 'SPELLING') {
                const originalChar = text.substring(error.position.start, error.position.end);
                const specialChar = this.specialCharacters.find(
                    char => char.variants?.includes(originalChar)
                );

                if (specialChar) {
                    suggestions.push({
                        original: originalChar,
                        suggested: specialChar.character,
                        reason: `Carácter especial del Kamëntsá: ${specialChar.description}`,
                        confidence: 0.9
                    });
                }
            }
        });

        return suggestions;
    }
} 