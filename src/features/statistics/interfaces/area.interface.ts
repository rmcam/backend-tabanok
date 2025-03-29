import { CategoryType, TrendType } from '../types/category.enum';

export interface Area {
    category: CategoryType;
    score: number;
    lastUpdated: string;
    trend: TrendType;
    recommendations: string[];
} 