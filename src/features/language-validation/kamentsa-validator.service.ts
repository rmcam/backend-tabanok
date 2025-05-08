import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
}

@Injectable()
export class KamentsaValidatorService {
  private readonly specialChars = ['ë', 's̈', 'ts̈', 'ñ'];
  private dictionary: any[] = [];
  private readonly logger = new Logger(KamentsaValidatorService.name);

  async onModuleInit() {
    await this.loadDictionary();
    this.logger.log(`Diccionario cargado con ${this.dictionary.length} palabras en onModuleInit`);
  }

  private async loadDictionary(): Promise<void> {
    try {
      const dictPath = path.join(
        process.cwd(),
        'src',
        'database',
        'files',
        'json',
        'consolidated_dictionary.json',
      );

      if (!fs.existsSync(dictPath)) {
        this.logger.error('Diccionario JSON no encontrado');
        return;
      }

      const dictData = await fs.promises.readFile(dictPath, 'utf-8');
      const parsedData = JSON.parse(dictData);
      this.dictionary = parsedData?.sections?.diccionario?.content?.kamensta_espanol || [];
      this.logger.log(
        `Diccionario cargado con ${this.dictionary.length} palabras`,
      );
    } catch (error) {
      this.logger.error('Error cargando diccionario:', error);
      this.dictionary = [{ entrada: 'ts̈ëngbe' }, { entrada: 'bëts' }, { entrada: 'ñandë' }, { entrada: 's̈ënts̈a' }];
    }
  }

  normalizeText(text: string): string {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  validateGrammar(text: string): string[] {
    const errors: string[] = [];

    // Regla: Palabras que terminan en "ts̈" generalmente llevan "ë" antes
    const words = text.trim().split(/\s+/); // Divide el texto en palabras por espacios
    for (const word of words) {
      if (word.endsWith('ts̈') && word.length >= 3 && word[word.length - 2] !== 'ë') {
        errors.push('Los términos que terminan en "ts̈" generalmente llevan "ë" antes: "ëts̈"');
      }
    }

    // Regla: "s̈" generalmente va seguida de "ë"
    // Busca instancias de "s̈" que no son seguidas por "ë" o "ä"
    const sWithoutEPattern = /s̈(?![ëä])/g;
    if (errors.length === 0 && sWithoutEPattern.test(text)) {
      errors.push('La "s̈" generalmente va seguida de "ë" en Kamëntsá');
    }

    // Aquí se pueden añadir más reglas gramaticales en el futuro

    // Regla: Las palabras deben comenzar con una vocal o una consonante permitida
    const allowedInitialConsonants = ['b', 'd', 'g', 'k', 'm', 'n', 'p', 's', 't', 'ts', 'y']; // Lista de consonantes permitidas al inicio de una palabra
    for (const word of words) {
      const firstChar = word.charAt(0).toLowerCase();
      if (!['a', 'e', 'i', 'o', 'u', 'ë'].includes(firstChar) && !allowedInitialConsonants.includes(firstChar)) {
        errors.push(`La palabra "${word}" debe comenzar con una vocal o una consonante permitida (${allowedInitialConsonants.join(', ')}).`);
      }
    }

    return errors;
  }

  /**
   * Valida la calidad lingüística del texto.
   * NOTA: Esta es una implementación placeholder. La validación real requeriría
   * análisis contextual, coherencia, cohesión y posiblemente modelos lingüísticos avanzados.
   * @param text El texto a validar.
   * @param context Opcional: Contexto adicional para la validación (ej. texto original, tema).
   * @returns Un objeto con puntuación y feedback sobre la calidad lingüística.
   */
  validateLinguisticQuality(text: string, context?: any): { score: number; feedback: string[] } {
    const feedback: string[] = [];
    let score = 0.3; // Puntuación base más baja para permitir mayor rango de mejora
    const trimmedText = text.trim();
    const textLength = trimmedText.length;
    const words = trimmedText.split(/\s+/).filter(word => word.length > 0); // Dividir en palabras no vacías
    const sentenceEndings = ['.', '?', '!'];
    const sentences = trimmedText.split(new RegExp(`[${sentenceEndings.join('')}]`)).filter(sentence => sentence.trim().length > 0);


    // --- Lógica Mejorada para evaluar calidad lingüística ---

    // 1. Puntuación basada en la longitud del texto y la presencia de oraciones
    const minLength = 30;
    const optimalLength = 150;
    if (textLength >= minLength) {
      score += Math.min(textLength / optimalLength, 1) * 0.2; // Max 0.2 por longitud
    }
    if (sentences.length > 0) {
        score += Math.min(sentences.length / 3, 1) * 0.1; // Max 0.1 por tener al menos 3 oraciones
    }


    // 2. Uso del diccionario y vocabulario
    const dictionaryWords = this.dictionary.map(entry => this.normalizeText(entry.entrada).toLowerCase());
    const textWordsNormalized = words.map(word => this.normalizeText(word).toLowerCase());
    const relevantWordsUsed = textWordsNormalized.filter(word => dictionaryWords.includes(word)).length;
    const uniqueWordsUsed = new Set(textWordsNormalized).size;

    if (words.length > 0) {
        // Puntuación basada en la proporción de palabras del diccionario
        const dictionaryCoverage = relevantWordsUsed / words.length;
        score += dictionaryCoverage * 0.15; // Max 0.15

        // Puntuación basada en la diversidad de vocabulario (simulación)
        const vocabularyDiversity = uniqueWordsUsed / words.length;
        score += Math.min(vocabularyDiversity, 1) * 0.05; // Max 0.05
    }


    // 3. Coherencia y Cohesión (Heurísticas básicas)
    // Simulación: Verificar la repetición de palabras (indicador de falta de cohesión)
    const wordFrequency: { [key: string]: number } = {};
    words.forEach(word => {
        const normalizedWord = this.normalizeText(word).toLowerCase();
        wordFrequency[normalizedWord] = (wordFrequency[normalizedWord] || 0) + 1;
    });
    const repeatedWords = Object.values(wordFrequency).filter(count => count > 2).length; // Palabras repetidas más de 2 veces
    score -= Math.min(repeatedWords / 5, 0.1); // Penalizar repetición (max 0.1)


    // Simulación: Verificar el uso de conectores básicos (placeholder)
    const connectors = ['y', 'pero', 'o', 'si', 'cuando', 'porque']; // Ejemplos de conectores
    const foundConnectors = connectors.filter(connector => textWordsNormalized.includes(connector)).length;
    score += Math.min(foundConnectors / connectors.length, 1) * 0.05; // Max 0.05 por usar conectores


    // 4. Adecuación al Contexto (si se proporciona)
    if (context && typeof context === 'string' && context.trim().length > 0) {
        // Simulación: Verificar si el texto contiene términos clave del contexto
        const contextTerms = context.toLowerCase().split(/\s+/).filter(term => term.length > 0);
        const matchingContextTerms = textWordsNormalized.filter(word => contextTerms.includes(word)).length;
        if (words.length > 0) {
             const contextMatchScore = matchingContextTerms / words.length;
             score += Math.min(contextMatchScore, 1) * 0.1; // Max 0.1 por adecuación al contexto
        }
    }


    // --- Fin Lógica Mejorada ---

    // Añadir feedback basado en la puntuación
    if (score < 0.5) {
      feedback.push('La calidad lingüística necesita mejoras significativas. Revise la estructura y el vocabulario.');
    } else if (score < 0.7) {
      feedback.push('La calidad lingüística es aceptable, pero hay áreas para mejorar en fluidez y precisión.');
    } else if (score < 0.9) {
      feedback.push('Buena calidad lingüística. El texto es claro y coherente.');
    } else {
      feedback.push('Excelente calidad lingüística. El texto es fluido, preciso y bien estructurado.');
    }

    // Asegurar que la puntuación esté entre 0 y 1
    score = Math.max(0, Math.min(score, 1.0));

    return { score, feedback };
  }


  async validateText(text: string, context?: any): Promise<ValidationResult> { // Añadir parámetro context
    if (this.dictionary.length === 0) {
      await this.loadDictionary();
    }
    const errors: string[] = [];
    const suggestions: string[] = [];

    // Validaciones existentes (ortografía, gramática básica, caracteres especiales)
    const specialCharErrors = this.validateSpecialCharacters(text);
    errors.push(...specialCharErrors);

    const grammarErrors = this.validateGrammar(text);
    errors.push(...grammarErrors);

    // Validar calidad lingüística (nuevo)
    const linguisticQuality = this.validateLinguisticQuality(text, context);
    // Podríamos añadir el feedback de calidad lingüística a las sugerencias o a un campo separado
    suggestions.push(...linguisticQuality.feedback);


    // Generar sugerencias basadas en errores o caracteres incorrectos
    if (errors.length > 0 || this.hasIncorrectSpecialChars(text)) {
      suggestions.push(...this.getSuggestions(text)); // getSuggestions might use normalizedText internally
    }

    // Check dictionary using original text (lowercase)
    // La validez general ahora podría depender de la ausencia de errores *y* una puntuación mínima de calidad
    const minQualityScoreForValidity = 0.7; // Definir un umbral de calidad
    const isValid =
      errors.length === 0 &&
      linguisticQuality.score >= minQualityScoreForValidity && // Considerar la puntuación de calidad
      this.dictionary.some(
        (word: any) => this.normalizeText(word.entrada).toLowerCase() === this.normalizeText(text).toLowerCase()
      );

    // Keep normalizedText for potential use in suggestions or other logic
    const normalizedText = this.normalizeText(text);

    console.log('validateText:', { text, isValid, errors, suggestions, linguisticQualityScore: linguisticQuality.score }); // Log para depuración
    return { isValid, errors, suggestions };
  }

  validateSpecialCharacters(text: string): string[] {
    const errors: string[] = [];

    if (text.includes('ts') && !text.includes('ts̈')) {
      errors.push('El dígrafo "ts" debe llevar diéresis: "ts̈"');
    }

    if (text.includes('s') && !text.includes('s̈')) {
      errors.push('La "s" debe llevar diéresis: "s̈"');
    }

    if (text.includes('e') && !text.includes('ë') && (text.includes('s̈') || text.includes('ts̈'))) {
      errors.push('La "e" debe llevar diéresis: "ë"');
    }

    return errors;
  }

 getWordTranslation(word: string): string {
    // Normalizar la palabra de entrada para la búsqueda
    const normalizedWord = this.normalizeText(word).toLowerCase();

    const translation = this.dictionary.find(entry => this.normalizeText(entry.entrada).toLowerCase() === normalizedWord);
    if (translation) {
      return translation.traduccion; // Asumiendo que la traducción está en la propiedad 'traduccion'
    }

    // Buscar sugerencias cercanas usando la distancia de Levenshtein
    const closeMatches = this.dictionary.filter((dictWord) => {
      const distance = this.levenshteinDistance(dictWord.entrada, word);
      return distance <= 2;
    });

    if (closeMatches.length > 0) {
      return `¿Quiso decir "${closeMatches[0].entrada}"?`; // Devolver la primera sugerencia
    }

    return 'Traducción no encontrada';
  }

  private hasIncorrectSpecialChars(text: string): boolean {
    let incorrectChars = false;

    if (text.includes('ts') && !text.includes('ts̈')) {
      incorrectChars = true;
    }

    if (text.includes('s') && !text.includes('s̈')) {
      incorrectChars = true;
    }

    if (text.includes('e') && !text.includes('ë') && (text.includes('s̈') || text.includes('ts̈'))) {
      incorrectChars = true;
    }

    return incorrectChars;
  }

  getSuggestions(text: string): string[] {
    const suggestions: string[] = [];
    const normalized = this.normalizeText(text);

    const exactMatches = this.dictionary.filter(
      (word: any) => this.normalizeText(word.entrada) === normalized,
    );
    if (exactMatches.length > 0) {
      return exactMatches.map((word: any) => `Corrección: "${word.entrada}"`);
    }

    const closeMatches = this.dictionary.filter((word: any) => {
      const distance = this.levenshteinDistance(
        this.normalizeText(word.entrada),
        normalized,
      );
      return distance <= 2;
    });

    closeMatches.forEach((word: any) => {
      suggestions.push(
        `¿Quiso decir "${word.entrada}"? (${this.getWordTranslation(word.entrada)})`,
      );
    });

    return suggestions.length > 0
      ? suggestions
      : ['Consulte el diccionario Kamëntsá para referencia'];
  }

  private levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = Array(b.length + 1)
      .fill(null)
      .map(() => Array(a.length + 1).fill(0));

    for (let i = 0; i <= a.length; i++) {
      matrix[i][0] = i;
    }
    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        if (a[i - 1] === b[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // reemplazo
            Math.min(
              matrix[i - 1][j] + 1, // eliminación
              matrix[i][j - 1] + 1 // inserción
            )
          );
        }
      }
    }

    return matrix[a.length][b.length];
  }
}
