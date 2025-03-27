import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamificationService } from '../gamification/gamification.service';
import { CreateStatisticsDto } from './dto/create-statistics.dto';
import { Statistics } from './entities/statistics.entity';

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
        if (lessonCompleted) {
            weekProgress.lessonsCompleted++;
            monthProgress.lessonsCompleted++;
        }
        if (exerciseCompleted) {
            weekProgress.exercisesCompleted++;
            monthProgress.exercisesCompleted++;
        }

        // Actualizar promedios y tiempo
        const updatePeriodProgress = (progress: any) => {
            const totalActivities = progress.lessonsCompleted + progress.exercisesCompleted;
            progress.averageScore = ((progress.averageScore * (totalActivities - 1)) + score) / totalActivities;
            progress.timeSpentMinutes += timeSpentMinutes;
        };

        updatePeriodProgress(weekProgress);
        updatePeriodProgress(monthProgress);

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
} 