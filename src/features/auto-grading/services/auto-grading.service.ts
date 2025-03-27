import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentVersion } from '../../content-versioning/entities/content-version.entity';
import { AutoGradingResult, GradingCriteria } from '../interfaces/auto-grading.interface';

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
        const content = version.content;

        // Verificar campos requeridos
        if (content.original) score += 0.4;
        if (content.translated) score += 0.2;
        if (content.culturalContext) score += 0.2;
        if (content.pronunciation) score += 0.1;
        if (content.dialectVariation) score += 0.1;

        // Verificar longitud y detalle
        const minLength = 10;
        const optimalLength = 100;
        const originalLength = content.original.length;

        if (originalLength >= minLength) {
            const lengthScore = Math.min(originalLength / optimalLength, 1);
            score = score * (0.7 + 0.3 * lengthScore);
        }

        return score;
    }

    private async evaluateAccuracy(version: ContentVersion): Promise<number> {
        let score = 0;
        const content = version.content;

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
        if (version.previousVersion) {
            const previousVersion = await this.versionRepository.findOne({
                where: { id: version.previousVersion }
            });
            if (previousVersion) {
                score += this.compareWithPreviousVersion(version, previousVersion) * 0.3;
            }
        }

        return score;
    }

    private evaluateCulturalRelevance(version: ContentVersion): number {
        let score = 0;
        const content = version.content;

        // Verificar presencia de elementos culturales
        if (content.culturalContext) {
            score += 0.4;

            // Analizar profundidad del contexto cultural
            const contextLength = content.culturalContext.length;
            const minContextLength = 50;
            const optimalContextLength = 200;

            if (contextLength >= minContextLength) {
                const contextScore = Math.min(contextLength / optimalContextLength, 1);
                score += contextScore * 0.3;
            }

            // Verificar referencias culturales específicas
            score += this.analyzeCulturalReferences(content.culturalContext) * 0.3;
        }

        return score;
    }

    private async evaluateDialectConsistency(version: ContentVersion): Promise<number> {
        let score = 0;
        const content = version.content;

        if (content.dialectVariation) {
            // Verificar consistencia con otros contenidos del mismo dialecto
            const similarContent = await this.versionRepository
                .createQueryBuilder('version')
                .where('version.content->\'dialectVariation\' = :dialect', {
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
        }

        return score;
    }

    private evaluateContextQuality(version: ContentVersion): number {
        let score = 0;
        const content = version.content;

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

    private checkLinguisticPatterns(text: string): number {
        // Implementar verificación de patrones lingüísticos
        // Por ahora retornamos un valor base
        return 0.8;
    }

    private compareWithPreviousVersion(current: ContentVersion, previous: ContentVersion): number {
        // Implementar comparación con versión anterior
        // Por ahora retornamos un valor base
        return 0.8;
    }

    private analyzeCulturalReferences(context: string): number {
        // Implementar análisis de referencias culturales
        // Por ahora retornamos un valor base
        return 0.8;
    }

    private compareDialectPatterns(version: ContentVersion, similarContent: ContentVersion[]): number {
        // Implementar comparación de patrones dialectales
        // Por ahora retornamos un valor base
        return 0.8;
    }

    private analyzeDialectCoherence(content: any): number {
        // Implementar análisis de coherencia dialectal
        // Por ahora retornamos un valor base
        return 0.8;
    }

    private evaluatePronunciationQuality(pronunciation: string): number {
        // Implementar evaluación de calidad de pronunciación
        // Por ahora retornamos un valor base
        return 0.8;
    }

    private evaluateContentIntegration(content: any): number {
        // Implementar evaluación de integración de contenido
        // Por ahora retornamos un valor base
        return 0.8;
    }

    private evaluateMetadataQuality(metadata: any): number {
        // Implementar evaluación de calidad de metadata
        // Por ahora retornamos un valor base
        return 0.8;
    }
} 