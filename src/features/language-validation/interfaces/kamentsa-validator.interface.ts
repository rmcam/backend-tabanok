export interface DictionaryEntry {
  entrada: string;
  traduccion?: string;
  equivalentes?: { palabra: string; idioma: string }[];
  significados?: { definicion: string }[];
}

export interface KamentsaValidator {
  normalizeText(text: string): string;
  validateGrammar(text: string): string[];
  validateText(text: string): Promise<ValidationResult>;
  validateSpecialCharacters(text: string): string[];
  getWordTranslation(word: string): string;
  getSuggestions(text: string): string[];
  loadDictionary(): Promise<void>;
  hasIncorrectSpecialChars(text: string): boolean;
  getDictionary(): DictionaryEntry[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
}
