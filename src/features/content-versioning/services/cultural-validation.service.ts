import { Injectable } from '@nestjs/common';
import { ContentVersion } from '../entities/content-version.entity';

export interface CulturalValidationResult {
    isValid: boolean;
    score: number;
    feedback: string[];
    suggestions: string[];
    requiredReviews: number;
    currentReviews: number;
}

@Injectable()
export class CulturalValidationService {
    private readonly MINIMUM_REVIEWS = 2;
    private readonly MINIMUM_SCORE = 0.7;

    async validateContent(
        version: ContentVersion,
        culturalExpertFeedback: {
            score: number;
            comments: string[];
            suggestions?: string[];
        }[]
    ): Promise<CulturalValidationResult> {
        const reviews = culturalExpertFeedback.length;
        const averageScore = culturalExpertFeedback.reduce((acc, curr) => acc + curr.score, 0) / reviews;

        const allComments = culturalExpertFeedback.flatMap(f => f.comments);
        const allSuggestions = culturalExpertFeedback.flatMap(f => f.suggestions || []);

        const isValid = reviews >= this.MINIMUM_REVIEWS && averageScore >= this.MINIMUM_SCORE;

        return {
            isValid,
            score: averageScore,
            feedback: allComments,
            suggestions: allSuggestions,
            requiredReviews: this.MINIMUM_REVIEWS,
            currentReviews: reviews
        };
    }

    async validateDialectVariation(
        version: ContentVersion,
        dialectExperts: {
            region: string;
            score: number;
            comments: string[];
        }[]
    ): Promise<{
        isValid: boolean;
        regionalVariations: {
            region: string;
            score: number;
            comments: string[];
        }[];
    }> {
        const validations = dialectExperts.map(expert => ({
            region: expert.region,
            score: expert.score,
            comments: expert.comments
        }));

        const averageScore = validations.reduce((acc, curr) => acc + curr.score, 0) / validations.length;

        return {
            isValid: averageScore >= this.MINIMUM_SCORE,
            regionalVariations: validations
        };
    }

    async validateCulturalContext(
        version: ContentVersion,
        context: {
            category: string;
            relevance: number;
            explanation: string;
        }[]
    ): Promise<{
        isValid: boolean;
        contextScore: number;
        categories: string[];
        feedback: string[];
    }> {
        const totalRelevance = context.reduce((acc, curr) => acc + curr.relevance, 0);
        const averageRelevance = totalRelevance / context.length;

        return {
            isValid: averageRelevance >= this.MINIMUM_SCORE,
            contextScore: averageRelevance,
            categories: context.map(c => c.category),
            feedback: context.map(c => c.explanation)
        };
    }

    async validateIntergenerationalValue(
        version: ContentVersion,
        evaluations: {
            ageGroup: string;
            relevance: number;
            feedback: string;
        }[]
    ): Promise<{
        isValid: boolean;
        valueScore: number;
        ageGroups: string[];
        recommendations: string[];
    }> {
        const totalRelevance = evaluations.reduce((acc, curr) => acc + curr.relevance, 0);
        const averageRelevance = totalRelevance / evaluations.length;

        return {
            isValid: averageRelevance >= this.MINIMUM_SCORE,
            valueScore: averageRelevance,
            ageGroups: evaluations.map(e => e.ageGroup),
            recommendations: evaluations.map(e => e.feedback)
        };
    }
} 