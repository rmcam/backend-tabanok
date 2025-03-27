import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamificationService } from '../gamification/gamification.service';
import { CreateStatisticsDto } from './dto/create-statistics.dto';
import { GenerateReportDto, ReportType, TimeFrame } from './dto/generate-report.dto';
import { Statistics } from './entities/statistics.entity';
import { BaseProgress, PeriodicProgress } from './interfaces/periodic-progress.interface';

@Injectable()
export class StatisticsService {
    constructor(
        @InjectRepository(Statistics)
        private statisticsRepository: Repository<Statistics>,
        private gamificationService: GamificationService,
    ) { }

    async create(createStatisticsDto: CreateStatisticsDto): Promise<Statistics> {
        const statistics = this.statisticsRepository.create(createStatisticsDto);
        return this.statisticsRepository.save(statistics);
    }

    async findAll(): Promise<Statistics[]> {
        return this.statisticsRepository.find();
    }

    async findOne(id: string): Promise<Statistics> {
        const statistics = await this.statisticsRepository.findOne({ where: { id } });
        if (!statistics) {
            throw new NotFoundException(`Statistics with ID ${id} not found`);
        }
        return statistics;
    }

    async findByUserId(userId: string): Promise<Statistics> {
        const statistics = await this.statisticsRepository.findOne({ where: { userId } });
        if (!statistics) {
            throw new NotFoundException(`Statistics for user ${userId} not found`);
        }
        return statistics;
    }

    async updateLearningProgress(
        userId: string,
        lessonCompleted: boolean,
        exerciseCompleted: boolean,
        score: number,
        timeSpentMinutes: number,
        category: string
    ): Promise<Statistics> {
        let statistics = await this.statisticsRepository.findOne({ where: { userId } });

        if (!statistics) {
            statistics = await this.create({ userId } as CreateStatisticsDto);
        }

        // Actualizar métricas de aprendizaje
        if (lessonCompleted) {
            statistics.learningMetrics.totalLessonsCompleted++;
        }
        if (exerciseCompleted) {
            statistics.learningMetrics.totalExercisesCompleted++;
        }

        // Actualizar promedio de puntuación
        const totalActivities = statistics.learningMetrics.totalLessonsCompleted +
            statistics.learningMetrics.totalExercisesCompleted;
        statistics.learningMetrics.averageScore =
            ((statistics.learningMetrics.averageScore * (totalActivities - 1)) + score) / totalActivities;

        // Actualizar tiempo total
        statistics.learningMetrics.totalTimeSpentMinutes += timeSpentMinutes;

        // Actualizar progreso por categoría
        if (category) {
            statistics.progressByCategory[category] =
                (statistics.progressByCategory[category] || 0) + score;
        }

        // Actualizar progreso semanal y mensual
        await this.updatePeriodicProgress(statistics, lessonCompleted, exerciseCompleted, score, timeSpentMinutes);

        // Actualizar áreas de fortaleza y mejora
        await this.updateStrengthAndImprovementAreas(statistics);

        return this.statisticsRepository.save(statistics);
    }

    private async updatePeriodicProgress(
        statistics: Statistics,
        lessonCompleted: boolean,
        exerciseCompleted: boolean,
        score: number,
        timeSpentMinutes: number
    ): Promise<void> {
        const now = new Date();
        const weekStart = this.getWeekStartDate(now);
        const monthStart = this.getMonthStartDate(now);

        // Actualizar progreso semanal
        let weekProgress = statistics.weeklyProgress.find(
            wp => this.isSameWeek(new Date(wp.weekStartDate), now)
        );

        if (!weekProgress) {
            weekProgress = {
                weekStartDate: weekStart,
                lessonsCompleted: 0,
                exercisesCompleted: 0,
                averageScore: 0,
                timeSpentMinutes: 0
            };
            statistics.weeklyProgress.unshift(weekProgress);
        }

        // Actualizar progreso mensual
        let monthProgress = statistics.monthlyProgress.find(
            mp => this.isSameMonth(new Date(mp.monthStartDate), now)
        );

        if (!monthProgress) {
            monthProgress = {
                monthStartDate: monthStart,
                lessonsCompleted: 0,
                exercisesCompleted: 0,
                averageScore: 0,
                timeSpentMinutes: 0
            };
            statistics.monthlyProgress.unshift(monthProgress);
        }

        // Actualizar métricas periódicas
        const updateProgress = (progress: BaseProgress) => {
            if (lessonCompleted) {
                progress.lessonsCompleted++;
            }
            if (exerciseCompleted) {
                progress.exercisesCompleted++;
            }

            const totalActivities = progress.lessonsCompleted + progress.exercisesCompleted;
            progress.averageScore = ((progress.averageScore * (totalActivities - 1)) + score) / totalActivities;
            progress.timeSpentMinutes += timeSpentMinutes;
        };

        updateProgress(weekProgress);
        updateProgress(monthProgress);

        // Mantener solo las últimas 52 semanas y 12 meses
        statistics.weeklyProgress = statistics.weeklyProgress.slice(0, 52);
        statistics.monthlyProgress = statistics.monthlyProgress.slice(0, 12);
    }

    private async updateStrengthAndImprovementAreas(statistics: Statistics): Promise<void> {
        const categories = Object.keys(statistics.progressByCategory);
        const scores = categories.map(category => ({
            category,
            score: statistics.progressByCategory[category]
        }));

        // Ordenar por puntuación
        scores.sort((a, b) => b.score - a.score);

        // Actualizar áreas de fortaleza (top 3)
        statistics.strengthAreas = scores.slice(0, 3).map(score => ({
            category: score.category,
            score: score.score,
            lastUpdated: new Date()
        }));

        // Actualizar áreas de mejora (últimos 3)
        statistics.improvementAreas = scores.slice(-3).map(score => ({
            category: score.category,
            score: score.score,
            lastUpdated: new Date()
        }));
    }

    async updateAchievementStats(userId: string, achievementCategory: string): Promise<Statistics> {
        const statistics = await this.findByUserId(userId);

        statistics.achievementStats.totalAchievements++;
        statistics.achievementStats.achievementsByCategory[achievementCategory] =
            (statistics.achievementStats.achievementsByCategory[achievementCategory] || 0) + 1;
        statistics.achievementStats.lastAchievementDate = new Date();

        return this.statisticsRepository.save(statistics);
    }

    async updateBadgeStats(userId: string, badgeTier: string): Promise<Statistics> {
        const statistics = await this.findByUserId(userId);

        statistics.badgeStats.totalBadges++;
        statistics.badgeStats.badgesByTier[badgeTier] =
            (statistics.badgeStats.badgesByTier[badgeTier] || 0) + 1;
        statistics.badgeStats.lastBadgeDate = new Date();

        return this.statisticsRepository.save(statistics);
    }

    private getWeekStartDate(date: Date): Date {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay());
        return d;
    }

    private getMonthStartDate(date: Date): Date {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(1);
        return d;
    }

    private isSameWeek(date1: Date, date2: Date): boolean {
        const week1 = this.getWeekStartDate(date1);
        const week2 = this.getWeekStartDate(date2);
        return week1.getTime() === week2.getTime();
    }

    private isSameMonth(date1: Date, date2: Date): boolean {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth();
    }

    async generateReport(generateReportDto: GenerateReportDto): Promise<any> {
        const statistics = await this.findByUserId(generateReportDto.userId);
        const { reportType, timeFrame, startDate, endDate, categories } = generateReportDto;

        let reportData: any = {};
        const dateRange = this.getDateRange(timeFrame, startDate, endDate);

        switch (reportType) {
            case ReportType.LEARNING_PROGRESS:
                reportData = await this.generateLearningProgressReport(statistics, dateRange, categories);
                break;
            case ReportType.ACHIEVEMENTS:
                reportData = await this.generateAchievementsReport(statistics, dateRange);
                break;
            case ReportType.PERFORMANCE:
                reportData = await this.generatePerformanceReport(statistics, dateRange, categories);
                break;
            case ReportType.COMPREHENSIVE:
                reportData = await this.generateComprehensiveReport(statistics, dateRange, categories);
                break;
        }

        return {
            userId: generateReportDto.userId,
            reportType,
            timeFrame,
            dateRange,
            generatedAt: new Date(),
            data: reportData
        };
    }

    private filterProgressByDate(
        statistics: Statistics,
        dateRange: { start: Date; end: Date }
    ): PeriodicProgress[] {
        const weeklyProgress = statistics.weeklyProgress.map(p => ({
            date: new Date(p.weekStartDate),
            lessonsCompleted: p.lessonsCompleted,
            exercisesCompleted: p.exercisesCompleted,
            averageScore: p.averageScore,
            timeSpentMinutes: p.timeSpentMinutes
        }));

        const monthlyProgress = statistics.monthlyProgress.map(p => ({
            date: new Date(p.monthStartDate),
            lessonsCompleted: p.lessonsCompleted,
            exercisesCompleted: p.exercisesCompleted,
            averageScore: p.averageScore,
            timeSpentMinutes: p.timeSpentMinutes
        }));

        const allProgress = [...weeklyProgress, ...monthlyProgress];
        return allProgress.filter(p => p.date >= dateRange.start && p.date <= dateRange.end);
    }

    private calculateAverageScore(progress: PeriodicProgress[]): number {
        if (progress.length === 0) return 0;
        return progress.reduce((sum, p) => sum + p.averageScore, 0) / progress.length;
    }

    private filterCategoriesProgress(
        progressByCategory: Record<string, number>,
        categories?: string[]
    ): Record<string, number> {
        if (!categories || categories.length === 0) return progressByCategory;
        return Object.fromEntries(
            Object.entries(progressByCategory)
                .filter(([category]) => categories.includes(category))
        );
    }

    private async generateLearningProgressReport(
        statistics: Statistics,
        dateRange: { start: Date; end: Date },
        categories?: string[]
    ): Promise<any> {
        const filteredProgress = this.filterProgressByDate(statistics, dateRange);

        return {
            summary: {
                totalLessonsCompleted: filteredProgress.reduce((sum, p) => sum + p.lessonsCompleted, 0),
                totalExercisesCompleted: filteredProgress.reduce((sum, p) => sum + p.exercisesCompleted, 0),
                averageScore: this.calculateAverageScore(filteredProgress),
                totalTimeSpent: filteredProgress.reduce((sum, p) => sum + p.timeSpentMinutes, 0),
            },
            progressByCategory: this.filterCategoriesProgress(statistics.progressByCategory, categories),
            timeline: filteredProgress.map(p => ({
                date: p.date,
                lessonsCompleted: p.lessonsCompleted,
                exercisesCompleted: p.exercisesCompleted,
                averageScore: p.averageScore,
                timeSpentMinutes: p.timeSpentMinutes
            }))
        };
    }

    private async generateAchievementsReport(
        statistics: Statistics,
        dateRange: { start: Date; end: Date }
    ): Promise<any> {
        return {
            totalAchievements: statistics.achievementStats.totalAchievements,
            achievementsByCategory: statistics.achievementStats.achievementsByCategory,
            recentAchievements: {
                count: this.countAchievementsInRange(statistics, dateRange),
                lastAchieved: statistics.achievementStats.lastAchievementDate
            },
            badgeProgress: {
                totalBadges: statistics.badgeStats.totalBadges,
                badgesByTier: statistics.badgeStats.badgesByTier,
                lastBadgeEarned: statistics.badgeStats.lastBadgeDate
            }
        };
    }

    private async generatePerformanceReport(
        statistics: Statistics,
        dateRange: { start: Date; end: Date },
        categories?: string[]
    ): Promise<any> {
        return {
            overallPerformance: {
                averageScore: statistics.learningMetrics.averageScore,
                streak: {
                    current: statistics.learningMetrics.currentStreak,
                    longest: statistics.learningMetrics.longestStreak
                }
            },
            strengthAreas: this.filterAreasByCategories(statistics.strengthAreas, categories),
            improvementAreas: this.filterAreasByCategories(statistics.improvementAreas, categories),
            progressTrends: this.calculateProgressTrends(statistics, dateRange)
        };
    }

    private async generateComprehensiveReport(
        statistics: Statistics,
        dateRange: { start: Date; end: Date },
        categories?: string[]
    ): Promise<any> {
        const [learningProgress, achievements, performance] = await Promise.all([
            this.generateLearningProgressReport(statistics, dateRange, categories),
            this.generateAchievementsReport(statistics, dateRange),
            this.generatePerformanceReport(statistics, dateRange, categories)
        ]);

        return {
            learningProgress,
            achievements,
            performance,
            recommendations: await this.generateRecommendations(statistics, categories)
        };
    }

    private getDateRange(timeFrame: TimeFrame, startDate?: Date, endDate?: Date): { start: Date; end: Date } {
        const end = endDate ? new Date(endDate) : new Date();
        let start: Date;

        switch (timeFrame) {
            case TimeFrame.WEEKLY:
                start = new Date(end);
                start.setDate(end.getDate() - 7);
                break;
            case TimeFrame.MONTHLY:
                start = new Date(end);
                start.setMonth(end.getMonth() - 1);
                break;
            case TimeFrame.YEARLY:
                start = new Date(end);
                start.setFullYear(end.getFullYear() - 1);
                break;
            case TimeFrame.CUSTOM:
                if (!startDate) throw new Error('Start date is required for custom time frame');
                start = new Date(startDate);
                break;
        }

        return { start, end };
    }

    private filterAreasByCategories(areas: any[], categories?: string[]): any[] {
        if (!categories || categories.length === 0) return areas;
        return areas.filter(area => categories.includes(area.category));
    }

    private countAchievementsInRange(
        statistics: Statistics,
        dateRange: { start: Date; end: Date }
    ): number {
        const lastAchievement = new Date(statistics.achievementStats.lastAchievementDate);
        return lastAchievement >= dateRange.start && lastAchievement <= dateRange.end ? 1 : 0;
    }

    private calculateProgressTrends(
        statistics: Statistics,
        dateRange: { start: Date; end: Date }
    ): any {
        const progress = this.filterProgressByDate(statistics, dateRange);

        if (progress.length < 2) return { trend: 'insufficient_data' };

        const firstScore = progress[0].averageScore;
        const lastScore = progress[progress.length - 1].averageScore;
        const improvement = ((lastScore - firstScore) / firstScore) * 100;

        return {
            trend: improvement > 0 ? 'improving' : improvement < 0 ? 'declining' : 'stable',
            improvementPercentage: improvement,
            consistencyScore: this.calculateConsistencyScore(progress)
        };
    }

    private calculateConsistencyScore(progress: PeriodicProgress[]): number {
        if (progress.length < 2) return 0;

        const scores = progress.map(p => p.averageScore);
        const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;

        // Normalizar la puntuación de consistencia (0-100)
        return Math.max(0, 100 - (Math.sqrt(variance) * 10));
    }

    private async generateRecommendations(
        statistics: Statistics,
        categories?: string[]
    ): Promise<any> {
        const recommendations = [];

        // Analizar áreas de mejora
        for (const area of statistics.improvementAreas) {
            if (!categories || categories.includes(area.category)) {
                recommendations.push({
                    type: 'improvement',
                    category: area.category,
                    message: `Se recomienda enfocarse en ejercicios de ${area.category} para mejorar el rendimiento.`,
                    priority: 'high'
                });
            }
        }

        // Analizar consistencia
        if (statistics.learningMetrics.currentStreak < statistics.learningMetrics.longestStreak) {
            recommendations.push({
                type: 'consistency',
                message: 'Mantén un ritmo constante de aprendizaje para mejorar tu racha actual.',
                priority: 'medium'
            });
        }

        // Analizar tiempo dedicado
        const averageTimePerSession = statistics.learningMetrics.totalTimeSpentMinutes /
            (statistics.learningMetrics.totalLessonsCompleted + statistics.learningMetrics.totalExercisesCompleted);

        if (averageTimePerSession < 15) {
            recommendations.push({
                type: 'time_management',
                message: 'Dedica más tiempo a cada sesión de aprendizaje para mejorar la retención.',
                priority: 'medium'
            });
        }

        return recommendations;
    }
} 