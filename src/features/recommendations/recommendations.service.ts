import { Injectable } from '@nestjs/common';
import { StatisticsService } from '../statistics/statistics.service';
import { CategoryType } from '../statistics/types/category.enum';
import {
    LearningPattern,
    Recommendation,
    RecommendationCriteria,
    RecommendationPriority,
    RecommendationType
} from './interfaces/recommendation.interface';

interface CategoryMetrics {
    progress: {
        completedExercises: number;
    };
}

@Injectable()
export class RecommendationsService {
    constructor(
        private readonly statisticsService: StatisticsService
    ) { }

    async generateRecommendations(userId: string): Promise<Recommendation[]> {
        const statistics = await this.statisticsService.findByUserId(userId);
        const criteria = await this.buildRecommendationCriteria(statistics);

        const recommendations: Recommendation[] = [];

        // Analizar patrones de aprendizaje
        const learningPattern = this.analyzeLearningPattern(statistics);

        // Generar recomendaciones basadas en fortalezas
        if (learningPattern.strongestCategories.length > 0) {
            recommendations.push(
                ...this.generateStrengthBasedRecommendations(learningPattern.strongestCategories, criteria)
            );
        }

        // Generar recomendaciones basadas en áreas de mejora
        if (learningPattern.weakestCategories.length > 0) {
            recommendations.push(
                ...this.generateImprovementRecommendations(learningPattern.weakestCategories, criteria)
            );
        }

        // Generar recomendaciones basadas en objetivos actuales
        if (criteria.currentGoals.length > 0) {
            recommendations.push(
                ...this.generateGoalBasedRecommendations(criteria.currentGoals, criteria)
            );
        }

        // Priorizar y filtrar recomendaciones
        return this.prioritizeRecommendations(recommendations, criteria);
    }

    private async buildRecommendationCriteria(statistics: any): Promise<RecommendationCriteria> {
        const recentProgress = statistics.weeklyProgress.map(progress => ({
            category: progress.category,
            score: progress.averageScore,
            timestamp: new Date(progress.weekStartDate)
        }));

        return {
            userLevel: this.calculateUserLevel(statistics),
            recentProgress,
            learningPattern: this.analyzeLearningPattern(statistics),
            availableTime: this.estimateAvailableTime(statistics),
            currentGoals: statistics.learningPath.customGoals.map(goal => ({
                category: goal.category,
                target: goal.target,
                deadline: new Date(goal.deadline)
            }))
        };
    }

    private analyzeLearningPattern(statistics: any): LearningPattern {
        const categoryMetrics = statistics.categoryMetrics;
        const categories = Object.keys(categoryMetrics) as CategoryType[];

        // Ordenar categorías por puntuación promedio
        const sortedCategories = categories.sort((a, b) =>
            categoryMetrics[b].progress.averageScore - categoryMetrics[a].progress.averageScore
        );

        return {
            preferredTimeOfDay: this.determinePreferredTimeOfDay(statistics),
            averageSessionDuration: this.calculateAverageSessionDuration(statistics),
            strongestCategories: sortedCategories.slice(0, 2),
            weakestCategories: sortedCategories.slice(-2).reverse(),
            completionRate: this.calculateCompletionRate(statistics),
            consistencyScore: this.calculateConsistencyScore(statistics)
        };
    }

    private generateStrengthBasedRecommendations(
        strongCategories: CategoryType[],
        criteria: RecommendationCriteria
    ): Recommendation[] {
        return strongCategories.map(category => ({
            id: `strength-${category}-${Date.now()}`,
            type: RecommendationType.CHALLENGE,
            priority: RecommendationPriority.HIGH,
            category,
            estimatedDuration: 30,
            difficulty: criteria.userLevel + 1,
            description: `Desafío avanzado en ${category}`,
            reason: 'Basado en tu excelente desempeño en esta categoría',
            prerequisites: [],
            expectedOutcomes: [{
                skill: category,
                improvement: 10
            }],
            adaptiveFeedback: {
                condition: 'Si el desafío resulta muy difícil',
                alternativeAction: 'Intentar un ejercicio de práctica de nivel intermedio'
            }
        }));
    }

    private generateImprovementRecommendations(
        weakCategories: CategoryType[],
        criteria: RecommendationCriteria
    ): Recommendation[] {
        return weakCategories.map(category => ({
            id: `improvement-${category}-${Date.now()}`,
            type: RecommendationType.PRACTICE,
            priority: RecommendationPriority.HIGH,
            category,
            estimatedDuration: 20,
            difficulty: Math.max(1, criteria.userLevel - 1),
            description: `Práctica enfocada en ${category}`,
            reason: 'Para fortalecer tus habilidades en esta área',
            prerequisites: [],
            expectedOutcomes: [{
                skill: category,
                improvement: 15
            }],
            adaptiveFeedback: {
                condition: 'Si encuentras dificultades',
                alternativeAction: 'Revisar los conceptos básicos de la categoría'
            }
        }));
    }

    private generateGoalBasedRecommendations(
        goals: Array<{ category: CategoryType; target: number; deadline: Date }>,
        criteria: RecommendationCriteria
    ): Recommendation[] {
        return goals
            .filter(goal => this.isGoalUrgent(goal))
            .map(goal => ({
                id: `goal-${goal.category}-${Date.now()}`,
                type: RecommendationType.NEXT_LESSON,
                priority: RecommendationPriority.MEDIUM,
                category: goal.category,
                estimatedDuration: 25,
                difficulty: criteria.userLevel,
                description: `Lección para alcanzar tu objetivo en ${goal.category}`,
                reason: `Para ayudarte a alcanzar tu meta antes de ${goal.deadline.toLocaleDateString()}`,
                prerequisites: [],
                expectedOutcomes: [{
                    skill: goal.category,
                    improvement: 12
                }],
                adaptiveFeedback: {
                    condition: 'Si el progreso es más lento de lo esperado',
                    alternativeAction: 'Ajustar el objetivo o aumentar el tiempo de práctica'
                }
            }));
    }

    private prioritizeRecommendations(
        recommendations: Recommendation[],
        criteria: RecommendationCriteria
    ): Recommendation[] {
        // Ordenar por prioridad y relevancia
        return recommendations
            .sort((a, b) => {
                // Primero por prioridad
                if (a.priority !== b.priority) {
                    return this.getPriorityWeight(b.priority) - this.getPriorityWeight(a.priority);
                }

                // Luego por relevancia para los objetivos actuales
                const aGoalRelevance = this.calculateGoalRelevance(a, criteria.currentGoals);
                const bGoalRelevance = this.calculateGoalRelevance(b, criteria.currentGoals);
                if (aGoalRelevance !== bGoalRelevance) {
                    return bGoalRelevance - aGoalRelevance;
                }

                // Finalmente por dificultad apropiada
                return Math.abs(a.difficulty - criteria.userLevel) -
                    Math.abs(b.difficulty - criteria.userLevel);
            })
            .slice(0, 5); // Limitar a 5 recomendaciones
    }

    private calculateUserLevel(statistics: any): number {
        const averageScore = statistics.learningMetrics.averageScore;
        const totalActivities =
            statistics.learningMetrics.totalLessonsCompleted +
            statistics.learningMetrics.totalExercisesCompleted;

        // Fórmula básica: (Puntuación promedio * 0.7 + Actividades completadas * 0.3) / 20
        return Math.floor((averageScore * 0.7 + Math.min(totalActivities, 100) * 0.3) / 20);
    }

    private determinePreferredTimeOfDay(statistics: any): string {
        const timeDistribution = statistics.weeklyProgress.reduce((acc, progress) => {
            const hour = new Date(progress.weekStartDate).getHours();
            if (hour >= 5 && hour < 12) acc.morning++;
            else if (hour >= 12 && hour < 17) acc.afternoon++;
            else if (hour >= 17 && hour < 22) acc.evening++;
            else acc.night++;
            return acc;
        }, { morning: 0, afternoon: 0, evening: 0, night: 0 });

        return Object.entries(timeDistribution)
            .reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }

    private calculateAverageSessionDuration(statistics: any): number {
        const sessions = statistics.weeklyProgress
            .map(p => p.timeSpentMinutes)
            .filter(time => time > 0);

        return sessions.length > 0
            ? Math.round(sessions.reduce((a, b) => a + b, 0) / sessions.length)
            : 30; // Duración predeterminada
    }

    private calculateCompletionRate(statistics: any): number {
        const totalAssigned = statistics.learningMetrics.totalLessonsCompleted +
            statistics.learningMetrics.totalExercisesCompleted;

        const categoryMetrics = statistics.categoryMetrics as Record<string, CategoryMetrics>;
        const totalCompleted = Object.values(categoryMetrics)
            .reduce((sum, category) =>
                sum + (category.progress?.completedExercises ?? 0), 0);

        return totalAssigned > 0 ? (totalCompleted / totalAssigned) * 100 : 0;
    }

    private calculateConsistencyScore(statistics: any): number {
        const weeklyProgress = statistics.weeklyProgress;
        if (weeklyProgress.length === 0) return 0;

        const consistencyFactors = weeklyProgress.map(week => ({
            activeDays: week.lessonsCompleted + week.exercisesCompleted > 0 ? 1 : 0,
            averageScore: week.averageScore,
            timeInvested: week.timeSpentMinutes
        }));

        const averageActiveDays = consistencyFactors
            .reduce((sum, week) => sum + week.activeDays, 0) / weeklyProgress.length;
        const scoreStability = this.calculateStandardDeviation(
            consistencyFactors.map(week => week.averageScore)
        );
        const timeConsistency = this.calculateStandardDeviation(
            consistencyFactors.map(week => week.timeInvested)
        );

        // Ponderación de factores
        return Math.round(
            averageActiveDays * 40 +
            (100 - scoreStability) * 0.3 +
            (100 - timeConsistency) * 0.3
        );
    }

    private calculateStandardDeviation(values: number[]): number {
        if (values.length === 0) return 0;

        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squareDiffs = values.map(value => Math.pow(value - mean, 2));
        const variance = squareDiffs.reduce((a, b) => a + b, 0) / values.length;

        return Math.sqrt(variance);
    }

    private isGoalUrgent(goal: { deadline: Date }): boolean {
        const now = new Date();
        const daysUntilDeadline = Math.ceil(
            (goal.deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilDeadline <= 7; // Considerar urgente si faltan 7 días o menos
    }

    private getPriorityWeight(priority: RecommendationPriority): number {
        switch (priority) {
            case RecommendationPriority.HIGH:
                return 3;
            case RecommendationPriority.MEDIUM:
                return 2;
            case RecommendationPriority.LOW:
                return 1;
        }
    }

    private calculateGoalRelevance(
        recommendation: Recommendation,
        goals: Array<{ category: CategoryType; target: number; deadline: Date }>
    ): number {
        const relevantGoals = goals.filter(goal =>
            goal.category === recommendation.category
        );

        if (relevantGoals.length === 0) return 0;

        return relevantGoals.reduce((maxRelevance, goal) => {
            const daysUntilDeadline = Math.ceil(
                (goal.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            const urgencyFactor = Math.max(0, (30 - daysUntilDeadline) / 30);
            return Math.max(maxRelevance, urgencyFactor);
        }, 0);
    }

    private estimateAvailableTime(statistics: any): number {
        const recentSessions = statistics.weeklyProgress
            .slice(-4) // Últimas 4 semanas
            .map(week => week.timeSpentMinutes);

        if (recentSessions.length === 0) return 30; // Tiempo predeterminado

        return Math.round(
            recentSessions.reduce((a, b) => a + b, 0) / recentSessions.length
        );
    }
} 