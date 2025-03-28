export enum KamentsaCharacterType {
    VOWEL = 'VOWEL',
    CONSONANT = 'CONSONANT',
    SPECIAL = 'SPECIAL',
    ACCENT = 'ACCENT'
}

export interface KamentsaCharacter {
    character: string;
    type: KamentsaCharacterType;
    description: string;
    variants?: string[];
}

export interface GrammaticalRule {
    id: string;
    description: string;
    pattern: RegExp;
    errorMessage: string;
    examples: {
        correct: string[];
        incorrect: string[];
    };
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    suggestions: ValidationSuggestion[];
}

export interface ValidationError {
    type: 'GRAMMAR' | 'SPELLING' | 'ACCENT' | 'STRUCTURE';
    message: string;
    position: {
        start: number;
        end: number;
    };
    rule?: GrammaticalRule;
}

export interface ValidationSuggestion {
    original: string;
    suggested: string;
    reason: string;
    confidence: number;
}

export interface KamentsaValidator {
    validateText(text: string): ValidationResult;
    validateWord(word: string): ValidationResult;
    validateSentence(sentence: string): ValidationResult;
    normalizeText(text: string): string;
    getSuggestions(text: string): ValidationSuggestion[];
    getCharacterInfo(char: string): KamentsaCharacter | null;
} 