import { CategoryType } from './category.enum';

export type AreaType = {
    category: CategoryType;
    score: number;
    lastUpdated: Date;
    trend: 'improving' | 'declining' | 'stable';
    recommendations: string[];
}; 