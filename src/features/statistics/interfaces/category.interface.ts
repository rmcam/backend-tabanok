import { CategoryDifficulty, CategoryStatus, CategoryType } from '../types/category.enum';

export interface Category {
    type: CategoryType;
    difficulty: CategoryDifficulty;
    status: CategoryStatus;
    progress: {
        totalExercises: number;
        completedExercises: number;
        averageScore: number;
        timeSpentMinutes: number;
        lastPracticed: string | null;
        masteryLevel: number;
        streak: number;
    };
    prerequisites: CategoryType[];
    unlockRequirements: {
        requiredScore: number;
        requiredCategories: CategoryType[];
    };
    subCategories?: string[];
} 