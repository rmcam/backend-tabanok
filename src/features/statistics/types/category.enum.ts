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

export enum TrendType {
    IMPROVING = 'improving',
    DECLINING = 'declining',
    STABLE = 'stable'
}

export enum FrequencyType {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly'
}

export enum GoalType {
    SCORE = 'score',
    EXERCISES = 'exercises',
    TIME = 'time',
    STREAK = 'streak'
} 