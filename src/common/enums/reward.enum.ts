export enum RewardType {
    BADGE = 'badge',
    POINTS = 'points',
    ACHIEVEMENT = 'achievement',
    CULTURAL = 'cultural',
    EXPERIENCE = 'experience',
    CONTENT = 'content',
    DISCOUNT = 'discount',
    EXCLUSIVE_CONTENT = 'exclusive_content',
    CUSTOMIZATION = 'customization',
}

export enum RewardStatus {
    ACTIVE = 'ACTIVE',
    CONSUMED = 'CONSUMED',
    // Agregar otros estados de recompensa según sea necesario
    EXPIRED = 'EXPIRED',
}

export enum RewardTrigger {
    LEVEL_UP = 'level_up',
    LESSON_COMPLETION = 'lesson_completion',
    EXERCISE_COMPLETION = 'exercise_completion', // Añadido
    // Agregar otros disparadores de recompensa según sea necesario
}
