export interface GradingCriteria {
    completeness: number;
    accuracy: number;
    culturalRelevance: number;
    dialectConsistency: number;
    contextQuality: number;
}

export interface AutoGradingResult {
    score: number;
    breakdown: GradingCriteria;
    feedback: string[];
    suggestions: string[];
    confidence: number;
} 