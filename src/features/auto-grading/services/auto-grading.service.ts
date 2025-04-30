import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentVersion } from '../../content-versioning/entities/content-version.entity';
import { AutoGradingResult, GradingCriteria } from '../interfaces/auto-grading.interface';

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
        private versionRepository: Repository<ContentVersion>
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
        const content: ContentDataStructure = version.contentData; // Use contentData and explicit type

        // Check for presence and non-empty content for key fields
        if (content.original?.trim().length > 0) {
            score += 0.3;
            // Add score based on length/detail for original
            const minLength = 10;
            const optimalLength = 100;
            const originalLength = content.original.trim().length;
            const lengthScore = Math.min(originalLength / optimalLength, 1);
            score += lengthScore * 0.1; // Max 0.1 for length
        }

        if (content.translated?.trim().length > 0) {
            score += 0.2;
            // Add score based on length/detail for translated
            const minLength = 10; // Assuming similar min length for translated
            const optimalLength = 100; // Assuming similar optimal length
            const translatedLength = content.translated.trim().length;
            const lengthScore = Math.min(translatedLength / optimalLength, 1);
            score += lengthScore * 0.1; // Max 0.1 for length
        }

        if (content.culturalContext?.trim().length > 0) {
            score += 0.15;
            // Add score based on length/detail for culturalContext
            const minLength = 20; // Cultural context might need more detail
            const optimalLength = 150;
            const contextLength = content.culturalContext.trim().length;
            const lengthScore = Math.min(contextLength / optimalLength, 1);
            score += lengthScore * 0.1; // Max 0.1 for length
        }

        if (content.pronunciation?.trim().length > 0) {
            score += 0.05;
        }

        if (content.dialectVariation?.trim().length > 0) {
            score += 0.05;
        }

        // Ensure score does not exceed 1.0
        return Math.min(score, 1.0);
    }

    private async evaluateAccuracy(version: ContentVersion): Promise<number> {
        let score = 0;
        const content: ContentDataStructure = version.contentData; // Use contentData and explicit type

        // Verificar consistencia entre original y traducción
        if (content.original && content.translated) {
            const originalWords = content.original.split(/\s+/).length;
            const translatedWords = content.translated.split(/\s+/).length;
            const ratio = Math.min(originalWords, translatedWords) / Math.max(originalWords, translatedWords);
            score += ratio * 0.4;
        }

        // Verificar patrones lingüísticos conocidos
        score += this.checkLinguisticPatterns(content.original) * 0.3;

        // Verificar coherencia con versiones anteriores
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

    private evaluateCulturalRelevance(version: ContentVersion): number {
        let score = 0;
        const content: ContentDataStructure = version.contentData; // Use contentData and explicit type

        // Verificar presencia de elementos culturales
        if (content.culturalContext) {
            score += 0.4;

            // Analizar profundidad del contexto cultural
            const contextLength = content.culturalContext.length;
            const minContextLength = 50;
            const optimalLength = 200;
            const contextScore = Math.min(contextLength / optimalLength, 1);
            score += contextScore * 0.3;

            // Verificar referencias culturales específicas
            score += this.analyzeCulturalReferences(content.culturalContext) * 0.3;
        }

        return score;
    }

    private async evaluateDialectConsistency(version: ContentVersion): Promise<number> {
        let score = 0;
        const content: ContentDataStructure = version.contentData; // Use contentData and explicit type

        // Si la variación dialectal está ausente o vacía, la consistencia es 0.
        if (!content || !content.dialectVariation?.trim()) {
            // Retornar 0 directamente si no hay dialecto para analizar.
            return 0;
        }

        // El código original tenía la lógica dentro de este if, se mueve fuera
        // if (content.dialectVariation) {

        // Verificar consistencia con otros contenidos del mismo dialecto
        const similarContent = await this.versionRepository
                .createQueryBuilder('version')
                .where('version.contentData->\'dialectVariation\' = :dialect', { // Use contentData
                    dialect: content.dialectVariation
                })
                .andWhere('version.id != :id', { id: version.id })
                .take(5)
                .getMany();

            if (similarContent.length > 0) {
                score += this.compareDialectPatterns(version, similarContent) * 0.6;
            }

            // Evaluar coherencia interna del dialecto
            score += this.analyzeDialectCoherence(content) * 0.4;
        // } // Se elimina el cierre del if original

        return score;
    }

    private evaluateContextQuality(version: ContentVersion): number {
        let score = 0;
        const content: ContentDataStructure = version.contentData; // Use contentData and explicit type

        // Evaluar calidad de la pronunciación
        if (content.pronunciation) {
            score += this.evaluatePronunciationQuality(content.pronunciation) * 0.4;
        }

        // Evaluar integración de elementos
        score += this.evaluateContentIntegration(content) * 0.3;

        // Evaluar metadata y etiquetas
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

    private checkLinguisticPatterns(text: string | undefined): number { // Allow undefined text
        // Implementar verificación de patrones lingüísticos
        // Ejemplo simple: verificar si el texto contiene la palabra "ejemplo"
        if (text && text.toLowerCase().includes('ejemplo')) {
            return 1.0; // Alta puntuación si contiene la palabra
        }
        // Por ahora retornamos un valor base si no se encuentra el patrón o el texto es undefined
        return 0.5; // Puntuación base si no se encuentra el patrón
    }

    private compareWithPreviousVersion(current: ContentVersion, previous: ContentVersion): number {
        // Implementar comparación con versión anterior
        // Ejemplo simple: comparar si el contenido original es similar
        // Ensure previousVersion.contentData is also treated as ContentDataStructure
        const previousContent: ContentDataStructure = previous.contentData;
        if (current.contentData?.original === previousContent?.original) { // Use contentData and optional chaining
            return 1.0; // Alta puntuación si el original no ha cambiado
        }
        // Por ahora retornamos un valor base si el original ha cambiado
        return 0.6; // Puntuación base si el original ha cambiado
    }

    private analyzeCulturalReferences(context: string | undefined): number { // Allow undefined context
        // Implementar análisis de referencias culturales
        // Ejemplo simple: verificar si el contexto menciona "tradición" o "costumbre"
        if (context && (context.toLowerCase().includes('tradición') || context.toLowerCase().includes('costumbre'))) {
            return 1.0; // Alta puntuación si menciona términos culturales
        }
        // Por ahora retornamos un valor base si no se encuentran referencias o el contexto es undefined
        return 0.5; // Puntuación base si no se encuentran referencias
    }

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

    private analyzeDialectCoherence(content: ContentDataStructure): number { // Explicitly type content
        // Implementación mejorada: Evaluar la coherencia interna del dialecto
        // NOTA: Esto es una simulación. Un análisis real requeriría reglas o modelos dialectales.

        let coherenceScore = 0;
        const dialectDescription = content.dialectVariation?.trim() || ''; // Use optional chaining

        // Puntuación basada en la longitud de la descripción del dialecto (indicador básico de detalle)
        const minDescriptionLength = 20;
        const optimalDescriptionLength = 100;
        const descriptionLength = dialectDescription.length;

        if (descriptionLength >= minDescriptionLength) {
            coherenceScore += Math.min(descriptionLength / optimalDescriptionLength, 1) * 0.5; // Max 0.5
        }

        // Simulación: Verificar si la descripción contiene términos clave relacionados con dialectos (placeholder)
        const dialectTerms = ['variación', 'regional', 'local', 'acento', 'vocabulario'];
        const foundTerms = dialectTerms.filter(term => dialectDescription.toLowerCase().includes(term)).length;

        if (foundTerms > 0) {
            coherenceScore += Math.min(foundTerms / dialectTerms.length, 1) * 0.5; // Max 0.5
        }


        // Asegurar que la puntuación no exceda 1.0
        return Math.min(coherenceScore, 1.0);
    }

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
