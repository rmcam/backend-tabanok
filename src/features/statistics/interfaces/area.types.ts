import { CategoryType } from '../types/category.enum';

export interface IArea {
    category: CategoryType;
    score: number;
    lastUpdated: Date;
    trend: 'improving' | 'declining' | 'stable';
    recommendations: string[];
}

export interface IAreaDTO extends IArea {
    toJSON(): IArea;
} 