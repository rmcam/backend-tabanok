export interface BaseProgress {
    lessonsCompleted: number;
    exercisesCompleted: number;
    averageScore: number;
    timeSpentMinutes: number;
    consistencyMetrics: {
        dailyStreak: number;
        weeklyCompletion: number;
        regularityScore: number;
        timeDistribution: {
            morning: number;
            afternoon: number;
            evening: number;
            night: number;
        };
    };
}

export interface WeeklyProgress extends BaseProgress {
    weekStartDate: Date;
    weeklyGoalsAchieved: number;
    weeklyGoalsTotal: number;
}

export interface MonthlyProgress extends BaseProgress {
    monthStartDate: Date;
    monthlyGoalsAchieved: number;
    monthlyGoalsTotal: number;
    improvementRate: number;
}

export interface PeriodicProgress extends BaseProgress {
    date: Date;
    dailyGoalsAchieved: number;
    dailyGoalsTotal: number;
    focusScore: number;
} 