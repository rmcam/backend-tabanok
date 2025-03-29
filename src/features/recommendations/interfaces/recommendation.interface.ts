import { CategoryType } from '../../statistics/types/category.enum';

export enum RecommendationType {
    NEXT_LESSON = 'NEXT_LESSON',
    PRACTICE = 'PRACTICE',
    REVIEW = 'REVIEW',
    CHALLENGE = 'CHALLENGE',
    EXPLORATION = 'EXPLORATION'
}

export enum RecommendationPriority {
    HIGH = 'HIGH',
    MEDIUM = 'MEDIUM',
    LOW = 'LOW'
}

export interface LearningPattern {
    preferredTimeOfDay: string;
    averageSessionDuration: number;
    strongestCategories: CategoryType[];
    weakestCategories: CategoryType[];
    completionRate: number;
    consistencyScore: number;
}

export interface RecommendationCriteria {
    userLevel: number;
    recentProgress: {
        category: CategoryType;
        score: number;
        timestamp: Date;
    }[];
    learningPattern: LearningPattern;
    availableTime: number;
    currentGoals: {
        category: CategoryType;
        target: number;
        deadline: Date;
    }[];
}

export interface Recommendation {
    id: string;
    type: RecommendationType;
    priority: RecommendationPriority;
    category: CategoryType;
    estimatedDuration: number;
    difficulty: number;
    description: string;
    reason: string;
    prerequisites: {
        category: CategoryType;
        minimumScore: number;
    }[];
    expectedOutcomes: {
        skill: string;
        improvement: number;
    }[];
    adaptiveFeedback?: {
        condition: string;
        alternativeAction: string;
    };
} 