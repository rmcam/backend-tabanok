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
}

export enum RewardTrigger {
    LEVEL_UP = 'level_up',
    LESSON_COMPLETION = 'lesson_completion',
    // Agregar otros disparadores de recompensa según sea necesario
}
