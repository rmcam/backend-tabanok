export enum CategoryType {
    VOCABULARY = 'vocabulary',
    GRAMMAR = 'grammar',
    PRONUNCIATION = 'pronunciation',
    COMPREHENSION = 'comprehension',
    WRITING = 'writing'
}

export enum CategoryStatus {
    LOCKED = 'LOCKED',
    AVAILABLE = 'AVAILABLE',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    MASTERED = 'MASTERED'
}

export enum CategoryDifficulty {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED'
}

export interface CategoryProgress {
    totalExercises: number;
    completedExercises: number;
    averageScore: number;
    timeSpentMinutes: number;
    lastPracticed: string | null;
    masteryLevel: number;
    streak: number;
}

export interface Category {
    type: CategoryType;
    difficulty: CategoryDifficulty;
    status: CategoryStatus;
    progress: CategoryProgress;
    prerequisites: CategoryType[];
    unlockRequirements: {
        requiredScore: number;
        requiredCategories: CategoryType[];
    };
    subCategories?: string[];
}

export interface Area {
    category: CategoryType;
    score: number;
    lastUpdated: Date;
    trend: 'improving' | 'declining' | 'stable';
    recommendations: string[];
} 