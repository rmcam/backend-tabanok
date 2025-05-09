import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentVersion } from '../../content-versioning/entities/content-version.entity';
import { AutoGradingResult, GradingCriteria } from '../interfaces/auto-grading.interface';
import { DictionaryService } from '../../dictionary/dictionary.service'; // Importar DictionaryService

// Define la estructura esperada para contentData
interface ContentDataStructure {
    original?: string;
    translated?: string;
    culturalContext?: string;
    pronunciation?: string;
    dialectVariation?: string;
    // Añadir otras propiedades si existen en contentData
}

@Injectable()
export class AutoGradingService {
    private readonly logger = new Logger(AutoGradingService.name);
    private readonly WEIGHTS = {
        completeness: 0.2,
        accuracy: 0.25,
        culturalRelevance: 0.25,
        dialectConsistency: 0.2,
        contextQuality: 0.1
    };

    constructor(
        @InjectRepository(ContentVersion)
        private versionRepository: Repository<ContentVersion>,
        private dictionaryService: DictionaryService // Inyectar DictionaryService
    ) { }

    async gradeContent(version: ContentVersion): Promise<AutoGradingResult> {
        const criteria = await this.evaluateAllCriteria(version);
        const score = this.calculateWeightedScore(criteria);
        const feedback = this.generateFeedback(criteria);
        const suggestions = this.generateSuggestions(criteria);
        const confidence = this.calculateConfidence(criteria);

        return {
            score,
            breakdown: criteria,
            feedback,
            suggestions,
            confidence
        };
    }

    private async evaluateAllCriteria(version: ContentVersion): Promise<GradingCriteria> {
        return {
            completeness: this.evaluateCompleteness(version),
            accuracy: await this.evaluateAccuracy(version),
            culturalRelevance: this.evaluateCulturalRelevance(version),
            dialectConsistency: await this.evaluateDialectConsistency(version),
            contextQuality: this.evaluateContextQuality(version)
        };
    }

    private evaluateCompleteness(version: ContentVersion): number {
        let score = 0;
        const content: ContentDataStructure = version.contentData;

        // Ponderaciones para la completitud de cada campo
        const fieldWeights = {
            original: 0.3,
            translated: 0.25,
            culturalContext: 0.2,
            pronunciation: 0.15,
            dialectVariation: 0.1
        };

        // Longitudes óptimas (ejemplos, ajustar según necesidad real del proyecto)
        const optimalLengths = {
            original: 100,
            translated: 100,
            culturalContext: 150,
            pronunciation: 30, // Asumiendo descripción o formato fonético
            dialectVariation: 50 // Asumiendo descripción del dialecto
        };

        // Evaluar cada campo
        if (content.original?.trim().length > 0) {
            const lengthScore = Math.min(content.original.trim().length / optimalLengths.original, 1);
            score += fieldWeights.original * (0.5 + lengthScore * 0.5); // 50% por presencia, 50% por longitud
        }

        if (content.translated?.trim().length > 0) {
            const lengthScore = Math.min(content.translated.trim().length / optimalLengths.translated, 1);
            score += fieldWeights.translated * (0.5 + lengthScore * 0.5);
        }

        if (content.culturalContext?.trim().length > 0) {
            const lengthScore = Math.min(content.culturalContext.trim().length / optimalLengths.culturalContext, 1);
            score += fieldWeights.culturalContext * (0.5 + lengthScore * 0.5);
        }

        if (content.pronunciation?.trim().length > 0) {
             const lengthScore = Math.min(content.pronunciation.trim().length / optimalLengths.pronunciation, 1);
            score += fieldWeights.pronunciation * (0.5 + lengthScore * 0.5);
        }

        if (content.dialectVariation?.trim().length > 0) {
             const lengthScore = Math.min(content.dialectVariation.trim().length / optimalLengths.dialectVariation, 1);
            score += fieldWeights.dialectVariation * (0.5 + lengthScore * 0.5);
        }


        // Asegurar que la puntuación no exceda 1.0
        return Math.min(score, 1.0);
    }

    /**
     * Evalúa la precisión del contenido comparando el original con la traducción,
     * verificando patrones lingüísticos y comparando con versiones anteriores.
     * NOTA: La precisión real requeriría análisis de texto avanzado y posiblemente modelos de PLN.
     * @param version La versión del contenido a evaluar.
     * @returns Puntuación de precisión (0 a 1).
     */
    private async evaluateAccuracy(version: ContentVersion): Promise<number> {
        let score = 0;
        const content: ContentDataStructure = version.contentData; // Use contentData and explicit type

        // Verificar consistencia entre original y traducción (simulación basada en longitud)
        // TODO: Implementar comparación de contenido más sofisticada (ej: similitud semántica, alineación de frases).
        if (content.original && content.translated) {
            const originalWords = content.original.split(/\s+/);
            const translatedWords = content.translated.split(/\s+/);
            let synonymMatchCount = 0;

            for (let i = 0; i < Math.min(originalWords.length, translatedWords.length); i++) {
                const originalWord = originalWords[i];
                const translatedWord = translatedWords[i];

                if (await this.dictionaryService.areSynonyms(originalWord, translatedWord)) {
                    synonymMatchCount++;
                }
            }

            const synonymRatio = synonymMatchCount / Math.max(originalWords.length, translatedWords.length);
            score += synonymRatio * 0.4;
        }

        // Verificar patrones lingüísticos conocidos (usando DictionaryService - simulación actual)
        // TODO: Mejorar la validación lingüística con reglas gramaticales, vocabulario extenso y análisis morfológico/sintáctico.
        // Considerar integrar herramientas externas de PLN o validadores lingüísticos específicos para Kamëntsá.
        score += this.checkLinguisticPatterns(content.original) * 0.3;

        // Verificar coherencia con versiones anteriores (simulación basada en longitud)
        // TODO: Implementar comparación de contenido más sofisticada con versiones anteriores para detectar regresiones o inconsistencias.
        if (version.metadata?.previousVersionId) { // Check for previousVersionId in metadata
            const previousVersion = await this.versionRepository.findOne({
                where: { id: version.metadata.previousVersionId } // Use previousVersionId
            });
            if (previousVersion) {
                // Ensure previousVersion.contentData is also treated as ContentDataStructure
                score += this.compareWithPreviousVersion(version, previousVersion) * 0.3;
            }
        }
        return score;
    }

    /**
     * Evalúa la relevancia cultural del contenido analizando el contexto cultural
     * y buscando referencias culturales específicas.
     * NOTA: Un análisis cultural preciso requeriría una base de conocimiento cultural o modelos de PLN.
     * @param version La versión del contenido a evaluar.
     * @returns Puntuación de relevancia cultural (0 a 1).
     */
    private evaluateCulturalRelevance(version: ContentVersion): number {
        let score = 0;
        const content: ContentDataStructure = version.contentData; // Use contentData and explicit type

        // Verificar presencia de elementos culturales
        if (content.culturalContext) {
            score += 0.4;

            // Analizar profundidad del contexto cultural (basado en longitud)
            const contextLength = content.culturalContext.length;
            const minContextLength = 50;
            const optimalLength = 200;
            const contextScore = Math.min(contextLength / optimalLength, 1);
            score += contextScore * 0.3;

            // Verificar referencias culturales específicas (simulación basada en lista de términos)
            // TODO: Ampliar la base de términos culturales y considerar el contexto en el que aparecen.
            // Podría requerir una ontología cultural o modelos de PLN entrenados en datos culturales Kamëntsá.
            score += this.analyzeCulturalReferences(content.culturalContext) * 0.3;
        }

        return score;
    }

    /**
     * Evalúa la consistencia dialectal del contenido comparándolo con otros contenidos
     * del mismo dialecto y analizando la coherencia interna.
     * NOTA: Un análisis dialectal preciso requeriría modelos lingüísticos específicos para cada dialecto.
     * @param version La versión del contenido a evaluar.
     * @returns Puntuación de consistencia dialectal (0 a 1).
     */
    private async evaluateDialectConsistency(version: ContentVersion): Promise<number> {
        let score = 0;
        const content: ContentDataStructure = version.contentData; // Use contentData and explicit type

        // Si la variación dialectal está ausente o vacía, la consistencia es 0.
        if (!content || !content.dialectVariation?.trim()) {
            // Retornar 0 directamente si no hay dialecto para analizar.
            return 0;
        }

        // Verificar consistencia con otros contenidos del mismo dialecto (simulación basada en proporción)
        // TODO: Implementar comparación de patrones dialectales más sofisticada (ej: análisis de características fonéticas, morfológicas, sintácticas).
        const similarContent = await this.versionRepository
            .createQueryBuilder('version')
            .where('version.contentData->\'dialectVariation\' = :dialect', { // Use contentData
                dialect: content.dialectVariation
            })
            .andWhere('version.id != :id', { id: version.id })
            .take(5) // Limitar para rendimiento
            .getMany();

        if (similarContent.length > 0) {
            score += this.compareDialectPatterns(version, similarContent) * 0.6;
        }

        // Evaluar coherencia interna del dialecto (simulación basada en longitud y términos)
        // TODO: Implementar análisis de coherencia interna basado en reglas o modelos dialectales específicos.
        score += this.analyzeDialectCoherence(content) * 0.4;

        return score;
    }

    /**
     * Evalúa la calidad general del contexto, incluyendo pronunciación, integración de elementos
     * y calidad de la metadata.
     * NOTA: Algunas evaluaciones son simulaciones y requerirían análisis más avanzados.
     * @param version La versión del contenido a evaluar.
     * @returns Puntuación de calidad del contexto (0 a 1).
     */
    private evaluateContextQuality(version: ContentVersion): number {
        let score = 0;
        const content: ContentDataStructure = version.contentData; // Use contentData and explicit type

        // Evaluar calidad de la pronunciación (simulación basada en presencia y formato)
        // TODO: Integrar análisis de audio o validar formatos fonéticos estructurados.
        if (content.pronunciation) {
            score += this.evaluatePronunciationQuality(content.pronunciation) * 0.4;
        }

        // Evaluar integración de elementos (simulación basada en campos llenos y menciones cruzadas)
        // TODO: Implementar análisis de coherencia temática y flujo entre los diferentes elementos del contenido.
        score += this.evaluateContentIntegration(content) * 0.3;

        // Evaluar metadata y etiquetas (simulación basada en cantidad y presencia de campos)
        // TODO: Implementar validación de relevancia y calidad de las etiquetas.
        if (version.metadata && version.metadata.tags) {
            score += this.evaluateMetadataQuality(version.metadata) * 0.3;
        }

        return score;
    }

    private calculateWeightedScore(criteria: GradingCriteria): number {
        return Object.entries(this.WEIGHTS).reduce((total, [key, weight]) => {
            return total + criteria[key] * weight;
        }, 0);
    }

    private generateFeedback(criteria: GradingCriteria): string[] {
        const feedback: string[] = [];

        if (criteria.completeness < 0.7) {
            feedback.push('Se recomienda completar más campos del contenido.');
        }
        if (criteria.accuracy < 0.7) {
            feedback.push('La precisión de la traducción podría mejorarse.');
        }
        if (criteria.culturalRelevance < 0.7) {
            feedback.push('El contexto cultural podría enriquecerse más.');
        }
        if (criteria.dialectConsistency < 0.7) {
            feedback.push('La consistencia dialectal podría mejorarse.');
        }
        if (criteria.contextQuality < 0.7) {
            feedback.push('La calidad del contexto general podría mejorarse.');
        }

        return feedback;
    }

    private generateSuggestions(criteria: GradingCriteria): string[] {
        const suggestions: string[] = [];

        if (criteria.completeness < 0.7) {
            suggestions.push('Agregar más detalles en la traducción y el contexto cultural.');
        }
        if (criteria.accuracy < 0.7) {
            suggestions.push('Revisar la correspondencia entre el contenido original y la traducción.');
        }
        if (criteria.culturalRelevance < 0.7) {
            suggestions.push('Incluir más referencias a prácticas culturales específicas.');
        }
        if (criteria.dialectConsistency < 0.7) {
            suggestions.push('Verificar la consistencia con otros contenidos del mismo dialecto.');
        }
        if (criteria.contextQuality < 0.7) {
            suggestions.push('Mejorar la integración entre los diferentes elementos del contenido.');
        }

        return suggestions;
    }

    private calculateConfidence(criteria: GradingCriteria): number {
        // Calcular la desviación estándar de los criterios
        const values = Object.values(criteria);
        const mean = values.reduce((a, b) => a + b) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        // La confianza es inversamente proporcional a la desviación estándar
        return Math.max(0, 1 - stdDev);
    }

    /**
     * Verifica patrones lingüísticos conocidos en el texto.
     * NOTA: Implementación básica. Requiere una base de reglas o modelos lingüísticos.
     * @param text El texto a analizar.
     * @returns Puntuación basada en patrones encontrados (0 a 1).
     */
    private checkLinguisticPatterns(text: string | undefined): number { // Allow undefined text
        // Implementar verificación de patrones lingüísticos
        // Ejemplo simple: verificar si el texto contiene la palabra "ejemplo"
        if (text && text.toLowerCase().includes('ejemplo')) {
            return 1.0; // Alta puntuación si contiene la palabra
        }
        // Por ahora retornamos un valor base si no se encuentra el patrón o el texto es undefined
        return 0.5; // Puntuación base si no se encuentra el patrón
    }

    /**
     * Compara la versión actual con una versión anterior para evaluar la coherencia.
     * NOTA: Implementación básica basada en longitud. Requiere análisis de texto avanzado para precisión.
     * @param current La versión actual.
     * @param previous La versión anterior.
     * @returns Puntuación de similitud (0 a 1).
     */
    private compareWithPreviousVersion(current: ContentVersion, previous: ContentVersion): number {
        // Implementación mejorada: Comparación con versión anterior
        // NOTA: Una comparación de contenido precisa requeriría análisis de texto avanzado.
        // Esto es una simulación básica.
        const previousContent: ContentDataStructure = previous.contentData;
        let similarityScore = 0;

        // Comparar original
        if (current.contentData?.original && previousContent?.original) {
            // Simulación: Puntuación basada en la similitud de longitud
            const originalLengthRatio = Math.min(current.contentData.original.length, previousContent.original.length) / Math.max(current.contentData.original.length, previousContent.original.length);
            similarityScore += originalLengthRatio * 0.4;
        }

        // Comparar traducción
        if (current.contentData?.translated && previousContent?.translated) {
             // Simulación: Puntuación basada en la similitud de longitud
            const translatedLengthRatio = Math.min(current.contentData.translated.length, previousContent.translated.length) / Math.max(current.contentData.translated.length, previousContent.translated.length);
            similarityScore += translatedLengthRatio * 0.4;
        }

        // Comparar contexto cultural
         if (current.contentData?.culturalContext && previousContent?.culturalContext) {
             // Simulación: Puntuación basada en la similitud de longitud
            const contextLengthRatio = Math.min(current.contentData.culturalContext.length, previousContent.culturalContext.length) / Math.max(current.contentData.culturalContext.length, previousContent.culturalContext.length);
            similarityScore += contextLengthRatio * 0.2;
        }


        // Asegurar que la puntuación no exceda 1.0
        return Math.min(similarityScore, 1.0);
    }

    /**
     * Analiza el contexto cultural en busca de referencias específicas.
     * NOTA: Implementación básica basada en lista de términos. Requiere una base de conocimiento cultural más rica.
     * @param context El texto del contexto cultural.
     * @returns Puntuación basada en referencias encontradas (0 a 1).
     */
    private analyzeCulturalReferences(context: string | undefined): number { // Allow undefined context
        // Implementación mejorada: Análisis de referencias culturales
        // NOTA: Un análisis cultural preciso requeriría una base de conocimiento cultural o modelos de PLN.
        // Esto es una simulación básica.
        if (!context) {
            return 0;
        }

        let culturalScore = 0;
        // Ampliar la lista de términos culturales relevantes para Tabanok (ejemplos)
        const culturalTerms = [
            'tradición', 'costumbre', 'ritual', 'creencia', 'historia', 'arte', 'música', 'danza',
            'gastronomía', 'vestimenta', 'mito', 'leyenda', 'celebración', 'ceremonia', 'artesanía',
            'cosmovisión', 'ancestral', 'comunidad', 'territorio', 'naturaleza', 'espiritualidad'
        ];
        const contextText = context.toLowerCase();
        const foundTerms = culturalTerms.filter(term => contextText.includes(term)).length;
        const contextLength = contextText.length;

        if (contextLength > 0) {
            // Puntuación basada en la densidad de términos culturales
            const termDensity = foundTerms / contextLength;
            // Normalizar la densidad (ajustar el factor de escala según la densidad esperada)
            const normalizedDensityScore = Math.min(termDensity * 500, 0.7); // Factor de escala 500, max 0.7
            culturalScore += normalizedDensityScore;
        }

        // Puntuación adicional basada en la longitud del contexto (indicador de detalle)
        const minContextLength = 50;
        const optimalLength = 200;

        if (contextLength >= minContextLength) {
            culturalScore += Math.min(contextLength / optimalLength, 1) * 0.3; // Max 0.3
        }

        // Asegurar que la puntuación no exceda 1.0
        return Math.min(culturalScore, 1.0);
    }

    /**
     * Compara patrones dialectales con contenido similar.
     * NOTA: Implementación básica. Requiere modelos lingüísticos específicos para cada dialecto.
     * @param version La versión actual.
     * @param similarContent Contenidos similares encontrados.
     * @returns Puntuación de similitud dialectal (0 a 1).
     */
    private compareDialectPatterns(version: ContentVersion, similarContent: ContentVersion[]): number {
        // Implementación mejorada: Comparar patrones dialectales con contenido similar
        // NOTA: Un análisis dialectal preciso requeriría modelos lingüísticos específicos
        // para cada dialecto. Esto es una simulación básica.

        let dialectSimilarityScore = 0;
        const currentDialect = version.contentData?.dialectVariation?.trim().toLowerCase(); // Use contentData and optional chaining

        if (!currentDialect) {
            return 0; // No se puede comparar si no hay dialecto definido
        }

        // Contar cuántos contenidos similares tienen el mismo dialecto
        const matchingDialectCount = similarContent.filter(
            content => content.contentData?.dialectVariation?.trim().toLowerCase() === currentDialect // Use contentData and optional chaining
        ).length;

        if (similarContent.length > 0) {
            // Puntuación basada en la proporción de contenidos similares con el mismo dialecto
            dialectSimilarityScore = matchingDialectCount / similarContent.length;
        }

        // Asegurar que la puntuación no exceda 1.0
        return Math.min(dialectSimilarityScore, 1.0);
    }

    /**
     * Evalúa la coherencia interna del dialecto.
     * NOTA: Implementación básica. Requiere reglas o modelos dialectales.
     * @param content Los datos del contenido.
     * @returns Puntuación de coherencia dialectal (0 a 1).
     */
    private analyzeDialectCoherence(content: ContentDataStructure): number { // Explicitly type content
        // Implementación mejorada: Evaluar la coherencia interna del dialecto
        // NOTA: Esto es una simulación. Un análisis real requeriría reglas o modelos dialectales.

        let coherenceScore = 0;
        const dialectDescription = content.dialectVariation?.trim() || '';
        const descriptionLength = dialectDescription.length;

        // Ampliar la lista de términos dialectales (ejemplos)
        const dialectTerms = [
            'variación', 'regional', 'local', 'acento', 'vocabulario', 'gramática',
            'fonética', 'morfología', 'sintaxis', 'modismos', 'jerga', 'pronunciación'
        ];
        const descriptionText = dialectDescription.toLowerCase();
        const foundTerms = dialectTerms.filter(term => descriptionText.includes(term)).length;

        if (descriptionLength > 0) {
             // Puntuación basada en la densidad de términos dialectales
            const termDensity = foundTerms / descriptionLength;
            // Normalizar la densidad (ajustar el factor de escala)
            const normalizedDensityScore = Math.min(termDensity * 500, 0.7); // Factor de escala 500, max 0.7
            coherenceScore += normalizedDensityScore;
        }


        // Puntuación adicional basada en la longitud de la descripción (indicador de detalle)
        const minDescriptionLength = 20;
        const optimalDescriptionLength = 100;

        if (descriptionLength >= minDescriptionLength) {
            coherenceScore += Math.min(descriptionLength / optimalDescriptionLength, 1) * 0.3; // Max 0.3
        }


        // Asegurar que la puntuación no exceda 1.0
        return Math.min(coherenceScore, 1.0);
    }

    /**
     * Evalúa la calidad de la pronunciación.
     * NOTA: Implementación básica. Requiere análisis de audio o formatos fonéticos estructurados.
     * @param pronunciation La cadena de pronunciación.
     * @returns Puntuación de calidad de pronunciación (0 a 1).
     */
    private evaluatePronunciationQuality(pronunciation: string | undefined): number { // Allow undefined pronunciation
        // Implementación mejorada: Evaluar la calidad de la pronunciación
        // NOTA: Una evaluación real requeriría análisis de audio o formatos fonéticos estructurados.
        // Esto es una simulación básica basada en la presencia y formato.

        let pronunciationScore = 0;
        const trimmedPronunciation = pronunciation?.trim() || ''; // Use optional chaining

        if (trimmedPronunciation.length > 0) {
            pronunciationScore += 0.5; // Puntuación base por tener contenido

            // Simulación: Verificar si parece tener un formato fonético básico (ej: contiene '/')
            if (trimmedPronunciation.includes('/') || trimmedPronunciation.includes('[') || trimmedPronunciation.includes(']')) {
                pronunciationScore += 0.5; // Puntuación adicional por formato
            }
        }

        // Asegurar que la puntuación no exceda 1.0
        return Math.min(pronunciationScore, 1.0);
    }

    /**
     * Evalúa la integración de los diferentes elementos del contenido.
     * NOTA: Implementación básica. Requiere análisis de coherencia temática.
     * @param content Los datos del contenido.
     * @returns Puntuación de integración (0 a 1).
     */
    private evaluateContentIntegration(content: ContentDataStructure): number { // Explicitly type content
        // Implementación mejorada: Evaluar la integración de elementos del contenido
        // NOTA: Esto es una simulación. Una evaluación real podría verificar la coherencia temática.

        let integrationScore = 0;
        const fields = [content.original, content.translated, content.culturalContext, content.pronunciation, content.dialectVariation];
        const filledFields = fields.filter(field => field?.trim().length > 0).length; // Use optional chaining

        // Puntuación basada en la proporción de campos llenos
        integrationScore = filledFields / fields.length;

        // Simulación: Verificar si hay alguna mención cruzada entre campos (placeholder)
        // Por ejemplo, si el contexto cultural menciona algo del original o traducido.
        if (content.original && content.culturalContext && content.culturalContext.includes(content.original.substring(0, Math.min(content.original.length, 20)))) {
             integrationScore = Math.min(integrationScore + 0.2, 1.0); // Pequeño bonus por mención cruzada simulada
        }


        // Asegurar que la puntuación no exceda 1.0
        return Math.min(integrationScore, 1.0);
    }

    /**
     * Evalúa la calidad de la metadata asociada al contenido.
     * NOTA: Implementación básica. Requiere validación de relevancia y calidad de etiquetas.
     * @param metadata La metadata del contenido.
     * @returns Puntuación de calidad de metadata (0 a 1).
     */
    private evaluateMetadataQuality(metadata: any): number {
        // Implementación mejorada: Evaluar la calidad de la metadata
        // NOTA: Esto es una simulación. Una evaluación real podría verificar la relevancia de las etiquetas.

        let metadataScore = 0;
        const tags = metadata?.tags || []; // Use optional chaining

        // Puntuación basada en la cantidad de etiquetas
        const minTags = 1;
        const optimalTags = 5;
        const tagCount = tags.length;

        if (tagCount >= minTags) {
            metadataScore += Math.min(tagCount / optimalTags, 1) * 0.7; // Max 0.7
        }

        // Simulación: Verificar si hay una descripción o título en la metadata (placeholder)
        if (metadata?.title?.trim().length > 0 || metadata?.description?.trim().length > 0) { // Use optional chaining
            metadataScore += 0.3; // Max 0.3
        }


        // Asegurar que la puntuación no exceda 1.0
        return Math.min(metadataScore, 1.0);
    }
}
