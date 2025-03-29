export interface BaseProgress {
    lessonsCompleted: number;
    exercisesCompleted: number;
    averageScore: number;
    timeSpentMinutes: number;
    consistencyMetrics: {
        daysActive: number;
        totalSessions: number;
        averageSessionDuration: number;
        preferredTimeOfDay: string;
        regularityScore: number;
        dailyStreak: number;
        weeklyCompletion: number;
        timeDistribution: Record<string, number>;
    };
}

export interface WeeklyProgress extends BaseProgress {
    week: string;
    weekStartDate: string;
    weeklyGoalsAchieved: number;
    weeklyGoalsTotal: number;
}

export interface MonthlyProgress extends BaseProgress {
    month: string;
    monthStartDate: string;
    monthlyGoalsAchieved: number;
    monthlyGoalsTotal: number;
    improvementRate: number;
}

export interface PeriodicProgress extends BaseProgress {
    date: string;
    dailyGoalsAchieved: number;
    dailyGoalsTotal: number;
    focusScore: number;
} 