import { CategoryType } from '../types/category.enum';

export interface StoredArea {
    category: CategoryType;
    score: number;
    lastUpdated: string;
    trend: 'improving' | 'declining' | 'stable';
    recommendations: string[];
} 