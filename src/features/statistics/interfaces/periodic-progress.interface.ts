export interface BaseProgress {
    lessonsCompleted: number;
    exercisesCompleted: number;
    averageScore: number;
    timeSpentMinutes: number;
}

export interface WeeklyProgress extends BaseProgress {
    weekStartDate: Date;
}

export interface MonthlyProgress extends BaseProgress {
    monthStartDate: Date;
}

export interface PeriodicProgress extends BaseProgress {
    date: Date;
} 