import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamificationService } from '../gamification/gamification.service';
import { CreateStatisticsDto } from './dto/create-statistics.dto';
import { GenerateReportDto, ReportType, TimeFrame } from './dto/generate-report.dto';
import { Statistics } from './entities/statistics.entity';
import { Area, Category, CategoryDifficulty, CategoryStatus, CategoryType } from './interfaces/category.interface';
import { BaseProgress, PeriodicProgress } from './interfaces/periodic-progress.interface';

@Injectable()
export class StatisticsService {
    constructor(
        @InjectRepository(Statistics)
        private statisticsRepository: Repository<Statistics>,
        private gamificationService: GamificationService,
    ) { }

    async create(createStatisticsDto: CreateStatisticsDto): Promise<Statistics> {
        const initialCategoryMetrics: Record<CategoryType, Category> = {
            [CategoryType.VOCABULARY]: {
                type: CategoryType.VOCABULARY,
                difficulty: CategoryDifficulty.BEGINNER,
                status: CategoryStatus.AVAILABLE,
                progress: {
                    totalExercises: 0,
                    completedExercises: 0,
                    averageScore: 0,
                    timeSpentMinutes: 0,
                    lastPracticed: null,
                    masteryLevel: 0,
                    streak: 0
                },
                prerequisites: [],
                unlockRequirements: {
                    requiredScore: 0,
                    requiredCategories: []
                },
                subCategories: ['sustantivos', 'verbos', 'adjetivos']
            },
            [CategoryType.GRAMMAR]: {
                type: CategoryType.GRAMMAR,
                difficulty: CategoryDifficulty.BEGINNER,
                status: CategoryStatus.LOCKED,
                progress: {
                    totalExercises: 0,
                    completedExercises: 0,
                    averageScore: 0,
                    timeSpentMinutes: 0,
                    lastPracticed: null,
                    masteryLevel: 0,
                    streak: 0
                },
                prerequisites: [CategoryType.VOCABULARY],
                unlockRequirements: {
                    requiredScore: 70,
                    requiredCategories: [CategoryType.VOCABULARY]
                },
                subCategories: ['tiempos_verbales', 'pronombres']
            },
            [CategoryType.PRONUNCIATION]: {
                type: CategoryType.PRONUNCIATION,
                difficulty: CategoryDifficulty.BEGINNER,
                status: CategoryStatus.AVAILABLE,
                progress: {
                    totalExercises: 0,
                    completedExercises: 0,
                    averageScore: 0,
                    timeSpentMinutes: 0,
                    lastPracticed: null,
                    masteryLevel: 0,
                    streak: 0
                },
                prerequisites: [],
                unlockRequirements: {
                    requiredScore: 0,
                    requiredCategories: []
                },
                subCategories: ['vocales', 'consonantes', 'entonacion']
            },
            [CategoryType.COMPREHENSION]: {
                type: CategoryType.COMPREHENSION,
                difficulty: CategoryDifficulty.INTERMEDIATE,
                status: CategoryStatus.LOCKED,
                progress: {
                    totalExercises: 0,
                    completedExercises: 0,
                    averageScore: 0,
                    timeSpentMinutes: 0,
                    lastPracticed: null,
                    masteryLevel: 0,
                    streak: 0
                },
                prerequisites: [CategoryType.VOCABULARY, CategoryType.GRAMMAR],
                unlockRequirements: {
                    requiredScore: 75,
                    requiredCategories: [CategoryType.VOCABULARY, CategoryType.GRAMMAR]
                },
                subCategories: ['lectura', 'audio']
            },
            [CategoryType.WRITING]: {
                type: CategoryType.WRITING,
                difficulty: CategoryDifficulty.ADVANCED,
                status: CategoryStatus.LOCKED,
                progress: {
                    totalExercises: 0,
                    completedExercises: 0,
                    averageScore: 0,
                    timeSpentMinutes: 0,
                    lastPracticed: null,
                    masteryLevel: 0,
                    streak: 0
                },
                prerequisites: [CategoryType.VOCABULARY, CategoryType.GRAMMAR, CategoryType.COMPREHENSION],
                unlockRequirements: {
                    requiredScore: 80,
                    requiredCategories: [CategoryType.VOCABULARY, CategoryType.GRAMMAR, CategoryType.COMPREHENSION]
                },
                subCategories: ['oraciones', 'parrafos']
            }
        };

        const initialAchievementsByCategory: Record<CategoryType, number> = {
            [CategoryType.VOCABULARY]: 0,
            [CategoryType.GRAMMAR]: 0,
            [CategoryType.PRONUNCIATION]: 0,
            [CategoryType.COMPREHENSION]: 0,
            [CategoryType.WRITING]: 0
        };

        const defaultStats: Partial<Statistics> = {
            userId: createStatisticsDto.userId,
            categoryMetrics: initialCategoryMetrics,
            strengthAreas: [],
            improvementAreas: [],
            learningMetrics: {
                totalLessonsCompleted: 0,
                totalExercisesCompleted: 0,
                averageScore: 0,
                totalTimeSpentMinutes: 0,
                longestStreak: 0,
                currentStreak: 0,
                lastActivityDate: null,
                totalMasteryScore: 0
            },
            weeklyProgress: [],
            monthlyProgress: [],
            achievementStats: {
                totalAchievements: 0,
                achievementsByCategory: initialAchievementsByCategory,
                lastAchievementDate: new Date(),
                specialAchievements: []
            },
            badgeStats: {
                totalBadges: 0,
                badgesByTier: {},
                lastBadgeDate: new Date(),
                activeBadges: []
            },
            learningPath: {
                currentLevel: 1,
                recommendedCategories: [],
                nextMilestones: [],
                customGoals: []
            }
        };

        const statistics = this.statisticsRepository.create(defaultStats);
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
        category: CategoryType
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
        if (category && statistics.categoryMetrics[category]) {
            const categoryMetric = statistics.categoryMetrics[category];
            categoryMetric.progress.averageScore =
                ((categoryMetric.progress.averageScore * categoryMetric.progress.totalExercises) + score) /
                (categoryMetric.progress.totalExercises + 1);
            categoryMetric.progress.totalExercises++;
        }

        // Actualizar progreso semanal y mensual
        await this.updatePeriodicProgress(statistics, lessonCompleted, exerciseCompleted, score, timeSpentMinutes);

        // Actualizar áreas de fortaleza y mejora
        await this.updateAreas(statistics);

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

    private async updateAreas(statistics: Statistics): Promise<void> {
        const categoryMetrics = statistics.categoryMetrics;
        const now = new Date();

        // Calcular puntuaciones para todas las categorías
        const scores = Object.entries(categoryMetrics)
            .map(([type, category]) => ({
                category: type as CategoryType,
                score: category.progress.masteryLevel,
                lastUpdated: now,
                trend: this.calculateTrend(category),
                recommendations: this.generateRecommendations(category)
            }))
            .sort((a, b) => b.score - a.score);

        // Actualizar áreas fuertes (top 3)
        statistics.strengthAreas = scores.slice(0, 3) as Area[];

        // Actualizar áreas de mejora (últimas 3)
        statistics.improvementAreas = scores.slice(-3).reverse() as Area[];
    }

    private calculateTrend(category: Category): 'improving' | 'declining' | 'stable' {
        // Implementar lógica para calcular tendencia basada en historial
        return 'stable';
    }

    private generateRecommendations(category: Category): string[] {
        const recommendations: string[] = [];

        if (category.progress.masteryLevel < 30) {
            recommendations.push('Practica ejercicios básicos con más frecuencia');
        } else if (category.progress.masteryLevel < 60) {
            recommendations.push('Intenta ejercicios más desafiantes');
        } else if (category.progress.masteryLevel < 90) {
            recommendations.push('Enfócate en temas avanzados');
        }

        if (category.progress.streak < 3) {
            recommendations.push('Mantén una práctica diaria consistente');
        }

        return recommendations;
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

        // Convertir las categorías de string[] a CategoryType[]
        const typedCategories = categories?.map(cat => cat as CategoryType);

        switch (reportType) {
            case ReportType.LEARNING_PROGRESS:
                reportData = await this.generateLearningProgressReport(statistics, dateRange, typedCategories);
                break;
            case ReportType.ACHIEVEMENTS:
                reportData = await this.generateAchievementsReport(statistics, dateRange);
                break;
            case ReportType.PERFORMANCE:
                reportData = await this.generatePerformanceReport(statistics, dateRange, typedCategories);
                break;
            case ReportType.COMPREHENSIVE:
                reportData = await this.generateComprehensiveReport(statistics, dateRange, typedCategories);
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
        categoryMetrics: Record<CategoryType, Category>,
        categories?: CategoryType[]
    ): Record<CategoryType, Category> {
        if (!categories || categories.length === 0) return categoryMetrics;
        return Object.fromEntries(
            Object.entries(categoryMetrics)
                .filter(([category]) => categories.includes(category as CategoryType))
        ) as Record<CategoryType, Category>;
    }

    private async generateLearningProgressReport(
        statistics: Statistics,
        dateRange: { start: Date; end: Date },
        categories?: CategoryType[]
    ): Promise<any> {
        const filteredProgress = this.filterProgressByDate(statistics, dateRange);

        return {
            summary: {
                totalLessonsCompleted: filteredProgress.reduce((sum, p) => sum + p.lessonsCompleted, 0),
                totalExercisesCompleted: filteredProgress.reduce((sum, p) => sum + p.exercisesCompleted, 0),
                averageScore: this.calculateAverageScore(filteredProgress),
                totalTimeSpent: filteredProgress.reduce((sum, p) => sum + p.timeSpentMinutes, 0),
            },
            categoryProgress: this.filterCategoriesProgress(statistics.categoryMetrics, categories),
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
        categories?: CategoryType[]
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
        categories?: CategoryType[]
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
            recommendations: this.generateRecommendations(statistics.categoryMetrics[CategoryType.VOCABULARY])
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

    private filterAreasByCategories(areas: Area[], categories?: CategoryType[]): Area[] {
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

    async updateCategoryProgress(
        userId: string,
        categoryType: CategoryType,
        score: number,
        timeSpentMinutes: number,
        exercisesCompleted: number
    ): Promise<Statistics> {
        const statistics = await this.findByUserId(userId);
        const categoryMetrics = statistics.categoryMetrics;
        const category = categoryMetrics[categoryType];

        if (!category) {
            throw new NotFoundException(`Categoría ${categoryType} no encontrada`);
        }

        // Actualizar métricas de progreso
        category.progress.totalExercises += exercisesCompleted;
        category.progress.completedExercises += exercisesCompleted;
        category.progress.timeSpentMinutes += timeSpentMinutes;

        // Actualizar promedio de puntuación
        const totalExercises = category.progress.completedExercises;
        const currentAverage = category.progress.averageScore;
        category.progress.averageScore =
            ((currentAverage * (totalExercises - exercisesCompleted)) + score) / totalExercises;

        // Actualizar fecha de última práctica y racha
        const now = new Date();
        const lastPracticed = category.progress.lastPracticed ?
            new Date(category.progress.lastPracticed) : null;

        if (lastPracticed) {
            const dayDiff = Math.floor((now.getTime() - lastPracticed.getTime()) / (1000 * 60 * 60 * 24));
            if (dayDiff === 1) {
                category.progress.streak += 1;
            } else if (dayDiff > 1) {
                category.progress.streak = 1;
            }
        } else {
            category.progress.streak = 1;
        }
        category.progress.lastPracticed = now.toISOString();

        // Actualizar nivel de maestría
        const newMasteryLevel = Math.floor(
            (category.progress.averageScore * 0.4) +
            (Math.min(category.progress.streak, 30) / 30 * 0.3) +
            (Math.min(category.progress.completedExercises, 100) / 100 * 0.3)
        );
        category.progress.masteryLevel = newMasteryLevel;

        // Actualizar áreas fuertes y de mejora
        await this.updateAreas(statistics);

        // Guardar cambios
        statistics.categoryMetrics = categoryMetrics;
        return this.statisticsRepository.save(statistics);
    }
} 