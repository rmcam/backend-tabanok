import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
}

@Injectable()
export class KamentsaValidatorService {
  private readonly specialChars = ['ë', 's̈', 'ts̈', 'ñ'];
  private dictionary: string[] = [];
  private readonly logger = new Logger(KamentsaValidatorService.name);

  async onModuleInit() {
    await this.loadDictionary();
  }

  private async loadDictionary(): Promise<void> {
    try {
      const dictPath = path.join(process.cwd(), 'files/json/dictionary.json');

      if (!fs.existsSync(dictPath)) {
        this.logger.warn(
          'Diccionario JSON no encontrado, usando diccionario extendido',
        );
        this.dictionary = [
          'ts̈ëngbe',
          'bëts',
          'ñandë',
          's̈ënts̈a',
          'jëts',
          'bëngbe',
          's̈ombi',
          'ts̈ants̈a',
          'ñapë',
          's̈ënts̈ë',
          'bës̈e',
          'jayan',
          'ts̈abe',
          's̈ëts̈e',
          'bës̈a',
          'jëñe',
        ];
        return;
      }

      const dictData = await fs.promises.readFile(dictPath, 'utf-8');
      this.dictionary = JSON.parse(dictData).words;
      this.logger.log(
        `Diccionario cargado con ${this.dictionary.length} palabras`,
      );
    } catch (error) {
      this.logger.error('Error cargando diccionario:', error);
      this.dictionary = ['ts̈ëngbe', 'bëts', 'ñandë', 's̈ënts̈a'];
    }
  }

  private parseDictionary(data: string): string[] {
    try {
      return JSON.parse(data).words || [];
    } catch {
      return [];
    }
  }

  async validateText(text: string): Promise<ValidationResult> {
    if (this.dictionary.length === 0) {
      await this.loadDictionary();
    }
    const errors: string[] = [];
    const suggestions: string[] = [];

    const specialCharErrors = this.validateSpecialCharacters(text);
    errors.push(...specialCharErrors);

    const grammarErrors = this.validateGrammar(text);
    errors.push(...grammarErrors);

    if (errors.length > 0 || this.hasIncorrectSpecialChars(text)) {
      suggestions.push(...this.getSuggestions(text));
    }

    const isValid =
      errors.length === 0 &&
      this.dictionary.some(
        (word) => word.toLowerCase() === text.toLowerCase(),
      ) &&
      !this.hasIncorrectSpecialChars(text);

    return { isValid, errors, suggestions };
  }

  validateSpecialCharacters(text: string): string[] {
    const errors: string[] = [];

    if (text.includes('ts') && !text.includes('ts̈')) {
      errors.push('El dígrafo "ts" debe llevar diéresis: "ts̈"');
    }

    if (text.includes('s') && !text.includes('s̈')) {
      errors.push('La letra "s" debe llevar diéresis: "s̈"');
    }

    if (
      text.includes('e') &&
      !text.includes('ë') &&
      (text.includes('s̈') || text.includes('ts̈'))
    ) {
      errors.push('En palabras con diéresis, la "e" debe ser "ë"');
    }

    return errors;
  }

  validateGrammar(text: string): string[] {
    const errors: string[] = [];
    const normalizedText = this.normalizeText(text).toLowerCase();

    if (text.length > 0) {
      if (
        !this.dictionary.some(
          (word) => this.normalizeText(word).toLowerCase() === normalizedText,
        )
      ) {
        errors.push('La palabra no existe en el diccionario Kamëntsá');
      }

      // Reglas gramaticales más flexibles
      if (
        text.endsWith('ts̈') &&
        !this.dictionary.some((word) => word.endsWith('ts̈'))
      ) {
        errors.push(
          'Los términos que terminan en "ts̈" generalmente llevan "ë" antes: "ëts̈"',
        );
      }

      if (
        text.includes('s̈') &&
        !this.dictionary.some(
          (word) => word.includes('s̈') && !word.includes('s̈ë'),
        )
      ) {
        errors.push('La "s̈" generalmente va seguida de "ë" en Kamëntsá');
      }
    }

    return errors;
  }

  private hasIncorrectSpecialChars(text: string): boolean {
    const hasIncorrectTs = text.includes('ts') && !text.includes('ts̈');
    const hasIncorrectS = text.includes('s') && !text.includes('s̈');
    const hasIncorrectE = text.includes('e') && !text.includes('ë');
    const hasIncorrectN = text.includes('n') && !text.includes('ñ');

    const hasCorrectTs = text.includes('ts̈');
    const hasCorrectS = text.includes('s̈');
    const hasCorrectE = text.includes('ë');
    const hasCorrectN = text.includes('ñ');

    return (
      ((hasIncorrectTs && !hasCorrectTs) ||
        (hasIncorrectS && !hasCorrectS) ||
        (hasIncorrectE && !hasCorrectE) ||
        (hasIncorrectN && !hasCorrectN)) &&
      !(hasCorrectTs || hasCorrectS || hasCorrectE || hasCorrectN)
    );
  }

  getSuggestions(text: string): string[] {
    const suggestions: string[] = [];
    const normalized = this.normalizeText(text);

    const exactMatches = this.dictionary.filter(
      (word) => this.normalizeText(word) === normalized,
    );
    if (exactMatches.length > 0) {
      return exactMatches.map((word) => `Corrección: "${word}"`);
    }

    const closeMatches = this.dictionary.filter((word) => {
      const distance = this.levenshteinDistance(
        this.normalizeText(word),
        normalized,
      );
      return distance <= 2;
    });

    closeMatches.forEach((word) => {
      suggestions.push(
        `¿Quiso decir "${word}"? (${this.getWordTranslation(word)})`,
      );
    });

    if (text.includes('ts') && !text.includes('ts̈')) {
      suggestions.push('El dígrafo "ts" debe llevar diéresis: "ts̈"');
    }
    if (text.includes('s') && !text.includes('s̈')) {
      suggestions.push('La "s" debe llevar diéresis: "s̈"');
    }
    if (text.includes('e') && !text.includes('ë')) {
      suggestions.push('La "e" debe llevar diéresis: "ë"');
    }
    if (text.includes('n') && !text.includes('ñ')) {
      suggestions.push('La "n" debe llevar tilde: "ñ" antes de vocal');
    }

    return suggestions.length > 0
      ? suggestions
      : ['Consulte el diccionario Kamëntsá para referencia'];
  }

  private levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = Array(b.length + 1)
      .fill(null)
      .map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) {
      matrix[0][i] = i;
    }

    for (let j = 0; j <= b.length; j++) {
      matrix[j][0] = j;
    }

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost,
        );
      }
    }

    return matrix[b.length][a.length];
  }

  private getWordTranslation(word: string): string {
    const translations: Record<string, string> = {
      ts̈ëngbe: 'casa',
      bëts: 'sol',
      ñandë: 'luna',
      s̈ënts̈a: 'agua',
    };
    return translations[word] || 'traducción no disponible';
  }

  normalizeText(text: string): string {
    let normalized = text
      .replace(/ts/g, 'ts̈')
      .replace(/s([^̈]|$)/g, 's̈$1')
      .normalize('NFC');

    normalized = this.normalizeVowels(normalized);

    return normalized;
  }

  private normalizeVowels(text: string): string {
    if (!this.specialChars.some((c) => text.includes(c))) {
      return text;
    }

    return (
      text
        .replace(/e(?!$)/g, (match, offset) =>
          offset > 0 && text[offset - 1].match(/[s̈ts̈]/) ? 'ë' : match,
        )
        .replace(/([aeiouë])n/g, (match, p1) => {
          const withN = p1 + 'n';
          const withNtilde = p1 + 'ñ';
          return this.dictionary.some(word => word.includes(withNtilde)) ? withNtilde : withN;
        })
        .replace(/([s̈ts̈])([aeiou])/g, (match, p1, p2) =>
          this.dictionary.some((word) => word.includes(p1 + p2))
            ? match
            : p1 + 'ë',
        )
    );
  }

  getCharacterInfo(
    char: string,
  ): { isSpecial: boolean; description: string } | null {
    if (this.specialChars.includes(char)) {
      return {
        isSpecial: true,
        description: `Carácter especial Kamëntsá: ${char}`,
      };
    }
    return null;
  }
}
