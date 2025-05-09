import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserLevelRepository } from "../gamification/repositories/user-level.repository";
import { GamificationService } from "../gamification/services/gamification.service";
import { CreateStatisticsDto } from "./dto/create-statistics.dto";
import { AreaDto } from "./dto/statistics-area.dto";
import {
  GenerateReportDto,
  ReportType,
  TimeFrame,
} from "./dto/statistics-report.dto";
import { Statistics } from "./entities/statistics.entity";
import { Area } from "./interfaces/area.interface";
import { Category } from "./interfaces/category.interface";
import {
  BaseProgress,
  MonthlyProgress,
  PeriodicProgress,
  WeeklyProgress,
} from "./interfaces/periodic-progress.interface";
import {
  CategoryDifficulty,
  CategoryStatus,
  CategoryType,
  TrendType,
} from "./types/category.enum";

interface UserStatistics {
  gamification: {
    points: number;
    level: number;
    gameStats: any;
    achievements: any[];
    rewards: any[];
    culturalPoints: number;
  };
  learning: {
    completedLessons: number;
    totalLessons: number;
    averageScore: number;
    timeSpent: number;
  };
}

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Statistics)
    private readonly statisticsRepository: Repository<Statistics>,
    private readonly userLevelRepository: UserLevelRepository,
    @Inject(GamificationService)
    private readonly gamificationService: GamificationService
  ) {}

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
          streak: 0,
        },
        prerequisites: [],
        unlockRequirements: {
          requiredScore: 0,
          requiredCategories: [],
        },
        subCategories: ["sustantivos", "verbos", "adjetivos"],
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
          streak: 0,
        },
        prerequisites: [CategoryType.VOCABULARY],
        unlockRequirements: {
          requiredScore: 70,
          requiredCategories: [CategoryType.VOCABULARY],
        },
        subCategories: ["tiempos_verbales", "pronombres"],
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
          streak: 0,
        },
        prerequisites: [],
        unlockRequirements: {
          requiredScore: 0,
          requiredCategories: [],
        },
        subCategories: ["vocales", "consonantes", "entonacion"],
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
          streak: 0,
        },
        prerequisites: [CategoryType.VOCABULARY, CategoryType.GRAMMAR],
        unlockRequirements: {
          requiredScore: 75,
          requiredCategories: [CategoryType.VOCABULARY, CategoryType.GRAMMAR],
        },
        subCategories: ["lectura", "audio"],
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
          streak: 0,
        },
        prerequisites: [
          CategoryType.VOCABULARY,
          CategoryType.GRAMMAR,
          CategoryType.COMPREHENSION,
        ],
        unlockRequirements: {
          requiredScore: 80,
          requiredCategories: [
            CategoryType.VOCABULARY,
            CategoryType.GRAMMAR,
            CategoryType.COMPREHENSION,
          ],
        },
        subCategories: ["oraciones", "parrafos"],
      },
      [CategoryType.SPEAKING]: {
        type: CategoryType.SPEAKING,
        difficulty: CategoryDifficulty.ADVANCED,
        status: CategoryStatus.LOCKED,
        progress: {
          totalExercises: 0,
          completedExercises: 0,
          averageScore: 0,
          timeSpentMinutes: 0,
          lastPracticed: null,
          masteryLevel: 0,
          streak: 0,
        },
        prerequisites: [
          CategoryType.VOCABULARY,
          CategoryType.GRAMMAR,
          CategoryType.COMPREHENSION,
        ],
        unlockRequirements: {
          requiredScore: 80,
          requiredCategories: [
            CategoryType.VOCABULARY,
            CategoryType.GRAMMAR,
            CategoryType.COMPREHENSION,
          ],
        },
        subCategories: ["dialogos", "presentaciones"],
      },
    };

    const initialAchievementsByCategory: Record<CategoryType, number> = {
      [CategoryType.VOCABULARY]: 0,
      [CategoryType.GRAMMAR]: 0,
      [CategoryType.PRONUNCIATION]: 0,
      [CategoryType.COMPREHENSION]: 0,
      [CategoryType.WRITING]: 0,
      [CategoryType.SPEAKING]: 0,
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
        totalMasteryScore: 0,
      },
      weeklyProgress: [],
      monthlyProgress: [],
      achievementStats: {
        totalAchievements: 0,
        achievementsByCategory: initialAchievementsByCategory,
        lastAchievementDate: new Date().toISOString(),
        specialAchievements: [],
      },
      badgeStats: {
        totalBadges: 0,
        badgesByTier: {},
        lastBadgeDate: new Date().toISOString(),
        activeBadges: [],
      },
      learningPath: {
        currentLevel: 1,
        recommendedCategories: [],
        nextMilestones: [],
        customGoals: [],
      },
    };

    const statistics = this.statisticsRepository.create(defaultStats);
    return this.statisticsRepository.save(statistics);
  }

  async findAll(): Promise<Statistics[]> {
    return this.statisticsRepository.find();
  }

  async findOne(id: string): Promise<Statistics> {
    const statistics = await this.statisticsRepository.findOne({
      where: { id },
    });
    if (!statistics) {
      throw new NotFoundException(`Statistics with ID ${id} not found`);
    }
    return statistics;
  }

  async findByUserId(userId: string): Promise<Statistics> {
    const statistics = await this.statisticsRepository.findOne({
      where: { userId },
    });
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
    let statistics = await this.statisticsRepository.findOne({
      where: { userId },
    });

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
    const totalActivities =
      statistics.learningMetrics.totalLessonsCompleted +
      statistics.learningMetrics.totalExercisesCompleted;
    statistics.learningMetrics.averageScore =
      (statistics.learningMetrics.averageScore * (totalActivities - 1) +
        score) /
      totalActivities;

    // Actualizar tiempo total
    statistics.learningMetrics.totalTimeSpentMinutes += timeSpentMinutes;

    // Actualizar progreso por categoría
    if (category && statistics.categoryMetrics[category]) {
      const categoryMetric = statistics.categoryMetrics[category];
      categoryMetric.progress.averageScore =
        (categoryMetric.progress.averageScore *
          categoryMetric.progress.totalExercises +
          score) /
        (categoryMetric.progress.totalExercises + 1);
      categoryMetric.progress.totalExercises++;
    }

    // Actualizar progreso semanal y mensual
    await this.updatePeriodicProgress(
      statistics,
      lessonCompleted,
      exerciseCompleted,
      score,
      timeSpentMinutes
    );

    // Actualizar áreas de fortaleza y mejora
    await this.updateAreas(statistics);

    // Actualizar progreso en el servicio de gamificación
    // Actualizar progreso en el servicio de gamificación
    await this.gamificationService.addPoints(userId, score);

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
    const baseProgress = this.createBaseProgress();
    baseProgress.lessonsCompleted = lessonCompleted ? 1 : 0;
    baseProgress.exercisesCompleted = exerciseCompleted ? 1 : 0;
    baseProgress.averageScore = score;
    baseProgress.timeSpentMinutes = timeSpentMinutes;

    // Actualizar progreso diario
    const dailyProgress: PeriodicProgress = {
      ...baseProgress,
      date: now.toISOString(),
      dailyGoalsAchieved: this.calculateDailyGoalsAchieved(statistics),
      dailyGoalsTotal: this.getDailyGoalsTotal(statistics),
      focusScore: this.calculateFocusScore(timeSpentMinutes, score),
    };

    // Actualizar progreso semanal
    let weeklyProgress = statistics.weeklyProgress.find((p) =>
      this.isSameWeek(new Date(p.weekStartDate), now)
    );

    if (!weeklyProgress) {
      weeklyProgress = {
        ...baseProgress,
        week: now.toISOString().split("T")[0],
        weekStartDate: this.getWeekStartDate(now).toISOString(),
        weeklyGoalsAchieved: 0,
        weeklyGoalsTotal: this.getWeeklyGoalsTotal(statistics),
      };
      statistics.weeklyProgress.push(weeklyProgress);
    } else {
      this.updateProgressMetrics(weeklyProgress, baseProgress);
      weeklyProgress.weeklyGoalsAchieved =
        this.calculateWeeklyGoalsAchieved(statistics);
    }

    // Actualizar progreso mensual
    let monthlyProgress = statistics.monthlyProgress.find((p) =>
      this.isSameMonth(new Date(p.monthStartDate), now)
    );

    if (!monthlyProgress) {
      monthlyProgress = {
        ...baseProgress,
        month: now.toISOString().split("T")[0].substring(0, 7),
        monthStartDate: this.getMonthStartDate(now).toISOString(),
        monthlyGoalsAchieved: 0,
        monthlyGoalsTotal: this.getMonthlyGoalsTotal(statistics),
        improvementRate: 0,
      };
      statistics.monthlyProgress.push(monthlyProgress);
    } else {
      this.updateProgressMetrics(monthlyProgress, baseProgress);
      monthlyProgress.monthlyGoalsAchieved =
        this.calculateMonthlyGoalsAchieved(statistics);
      monthlyProgress.improvementRate = this.calculateImprovementRate(
        statistics,
        monthlyProgress
      );
    }
  }

  private calculateDailyStreak(statistics: Statistics): number {
    const now = new Date();
    let streak = 0;
    let currentDate = new Date(now);

    for (const progress of statistics.weeklyProgress.sort(
      (a, b) =>
        new Date(b.weekStartDate).getTime() -
        new Date(a.weekStartDate).getTime()
    )) {
      if (this.hasActivityOnDate(progress, currentDate)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateWeeklyCompletion(statistics: Statistics): number {
    const currentWeekProgress = statistics.weeklyProgress.find((p) =>
      this.isSameWeek(new Date(p.weekStartDate), new Date())
    );

    if (!currentWeekProgress) return 0;

    return (
      (currentWeekProgress.weeklyGoalsAchieved /
        currentWeekProgress.weeklyGoalsTotal) *
      100
    );
  }

  private calculateRegularityScore(statistics: Statistics): number {
    const recentProgress = statistics.weeklyProgress
      .slice(-4) // Últimas 4 semanas
      .map((p) => p.timeSpentMinutes);

    if (recentProgress.length === 0) return 0;

    const average =
      recentProgress.reduce((a, b) => a + b, 0) / recentProgress.length;
    const variance =
      recentProgress
        .map((x) => Math.pow(x - average, 2))
        .reduce((a, b) => a + b, 0) / recentProgress.length;

    // Normalizar el score entre 0 y 100
    return Math.max(0, 100 - (Math.sqrt(variance) / average) * 100);
  }

  private calculateTimeDistribution(
    input: Date | { minutes: number; date: string }[],
    timeSpentMinutes: number
  ): Record<string, number> {
    if (input instanceof Date) {
      const hour = input.getHours();
      return {
        morning: hour >= 6 && hour < 12 ? 1 : 0,
        afternoon: hour >= 12 && hour < 18 ? 1 : 0,
        evening: hour >= 18 && hour < 24 ? 1 : 0,
        night: hour < 6 ? 1 : 0,
      };
    } else {
      return input.reduce(
        (acc, { minutes, date }) => {
          const hour = new Date(date).getHours();
          acc[hour] = (acc[hour] || 0) + minutes;
          return acc;
        },
        {} as Record<string, number>
      );
    }
  }

  private calculateFocusScore(timeSpentMinutes: number, score: number): number {
    // Calcular un score de enfoque basado en el tiempo invertido y el resultado
    const timeEfficiency =
      Math.min(1, score / 100) * (60 / Math.max(timeSpentMinutes, 1));
    return Math.round(timeEfficiency * 100);
  }

  private hasActivityOnDate(progress: WeeklyProgress, date: Date): boolean {
    return progress.lessonsCompleted > 0 || progress.exercisesCompleted > 0;
  }

  private updateProgressMetrics(
    target: BaseProgress,
    source: BaseProgress
  ): void {
    target.lessonsCompleted += source.lessonsCompleted;
    target.exercisesCompleted += source.exercisesCompleted;
    target.timeSpentMinutes += source.timeSpentMinutes;
    target.averageScore =
      (target.averageScore *
        (target.lessonsCompleted + target.exercisesCompleted - 1) +
        source.averageScore) /
      (target.lessonsCompleted + target.exercisesCompleted);

    // Actualizar métricas de consistencia
    target.consistencyMetrics = {
      daysActive:
        target.consistencyMetrics.daysActive +
        (source.consistencyMetrics.daysActive > 0 ? 1 : 0),
      totalSessions:
        target.consistencyMetrics.totalSessions +
        source.consistencyMetrics.totalSessions,
      averageSessionDuration:
        (target.consistencyMetrics.averageSessionDuration *
          target.consistencyMetrics.totalSessions +
          source.consistencyMetrics.averageSessionDuration *
            source.consistencyMetrics.totalSessions) /
        (target.consistencyMetrics.totalSessions +
          source.consistencyMetrics.totalSessions || 1),
      preferredTimeOfDay: this.determinePreferredTimeOfDay(
        target.consistencyMetrics.timeDistribution
      ),
      regularityScore: Math.max(
        target.consistencyMetrics.regularityScore,
        source.consistencyMetrics.regularityScore
      ),
      dailyStreak: Math.max(
        target.consistencyMetrics.dailyStreak,
        source.consistencyMetrics.dailyStreak
      ),
      weeklyCompletion: source.consistencyMetrics.weeklyCompletion,
      timeDistribution: {
        ...target.consistencyMetrics.timeDistribution,
        ...source.consistencyMetrics.timeDistribution,
      },
    };
  }

  private async updateAreas(statistics: Statistics): Promise<void> {
    const now = new Date();
    const scores = Object.entries(
      statistics.categoryMetrics as Record<CategoryType, Category>
    )
      .map(([type, category]) =>
        this.mapCategoryToArea(type as CategoryType, category as Category)
      )
      .sort((a, b) => b.score - a.score);

    const totalCategories = scores.length;
    const strengthCount = Math.ceil(totalCategories * 0.3); // Top 30%
    const improvementCount = Math.ceil(totalCategories * 0.3); // Bottom 30%

    statistics.strengthAreas = scores.slice(0, strengthCount);
    statistics.improvementAreas = scores.slice(-improvementCount).reverse();

    await this.statisticsRepository.save(statistics);
  }

  private calculateTrend(
    category: Category
  ): "improving" | "declining" | "stable" {
    // Implementación del cálculo de tendencia
    return "stable";
  }

  private generateRecommendations(category: Category): string[] {
    // Implementación de recomendaciones
    return [];
  }

  private mapCategoryToArea(
    categoryType: CategoryType,
    category: Category
  ): AreaDto {
    return new AreaDto({
      category: categoryType,
      score: category.progress.masteryLevel,
      lastUpdated: category.progress.lastPracticed || new Date().toISOString(),
      trend: this.calculateTrend(category) as TrendType,
      recommendations: this.generateRecommendations(category),
    });
  }

  async updateAchievementStats(
    userId: string,
    achievementCategory: string
  ): Promise<Statistics> {
    const statistics = await this.findByUserId(userId);

    statistics.achievementStats.totalAchievements++;
    statistics.achievementStats.achievementsByCategory[achievementCategory] =
      (statistics.achievementStats.achievementsByCategory[
        achievementCategory
      ] || 0) + 1;
    statistics.achievementStats.lastAchievementDate = new Date().toISOString();

    return this.statisticsRepository.save(statistics);
  }

  async updateBadgeStats(
    userId: string,
    badgeTier: string
  ): Promise<Statistics> {
    const statistics = await this.findByUserId(userId);

    statistics.badgeStats.totalBadges++;
    statistics.badgeStats.badgesByTier[badgeTier] =
      (statistics.badgeStats.badgesByTier[badgeTier] || 0) + 1;
    statistics.badgeStats.lastBadgeDate = new Date().toISOString();

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
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth()
    );
  }

  async generateReport(generateReportDto: GenerateReportDto): Promise<any> {
    const statistics = await this.findByUserId(generateReportDto.userId);
    const { reportType, timeFrame, startDate, endDate, categories } =
      generateReportDto;

    let reportData: any = {};
    const dateRange = this.getDateRange(timeFrame, startDate, endDate);

    // Convertir las categorías de string[] a CategoryType[]
    const typedCategories = categories?.map((cat) => cat as CategoryType);

    switch (reportType) {
      case ReportType.LEARNING_PROGRESS:
        reportData = await this.generateLearningProgressReport(
          statistics,
          dateRange,
          typedCategories
        );
        break;
      case ReportType.ACHIEVEMENTS:
        reportData = await this.generateAchievementsReport(
          statistics,
          dateRange
        );
        break;
      case ReportType.PERFORMANCE:
        reportData = await this.generatePerformanceReport(
          statistics,
          dateRange,
          typedCategories
        );
        break;
      case ReportType.COMPREHENSIVE:
        reportData = await this.generateComprehensiveReport(
          statistics,
          dateRange,
          typedCategories
        );
        break;
    }

    return {
      userId: generateReportDto.userId,
      reportType,
      timeFrame,
      dateRange,
      generatedAt: new Date(),
      data: reportData,
    };
  }

  private filterProgressByDate(
    statistics: Statistics,
    dateRange: { start: Date; end: Date }
  ): PeriodicProgress[] {
    const weeklyProgress = statistics.weeklyProgress.map((p) => ({
      ...p,
      date: new Date(p.weekStartDate).toISOString(),
      dailyGoalsAchieved: this.calculateDailyGoalsAchieved(statistics),
      dailyGoalsTotal: this.getDailyGoalsTotal(statistics),
      focusScore: this.calculateFocusScore(p.timeSpentMinutes, p.averageScore),
      consistencyMetrics: {
        daysActive: 0,
        totalSessions: 0,
        averageSessionDuration: 0,
        preferredTimeOfDay: "morning",
        regularityScore: this.calculateRegularityScore(statistics),
        dailyStreak: this.calculateDailyStreak(statistics),
        weeklyCompletion: this.calculateWeeklyCompletion(statistics),
        timeDistribution: this.calculateTimeDistribution(
          new Date(p.weekStartDate),
          p.timeSpentMinutes
        ),
      },
    }));

    const monthlyProgress = statistics.monthlyProgress.map((p) => ({
      ...p,
      date: new Date(p.monthStartDate).toISOString(),
      dailyGoalsAchieved: this.calculateDailyGoalsAchieved(statistics),
      dailyGoalsTotal: this.getDailyGoalsTotal(statistics),
      focusScore: this.calculateFocusScore(p.timeSpentMinutes, p.averageScore),
      consistencyMetrics: {
        daysActive: 0,
        totalSessions: 0,
        averageSessionDuration: 0,
        preferredTimeOfDay: "morning",
        regularityScore: this.calculateRegularityScore(statistics),
        dailyStreak: this.calculateDailyStreak(statistics),
        weeklyCompletion: this.calculateWeeklyCompletion(statistics),
        timeDistribution: this.calculateTimeDistribution(
          new Date(p.monthStartDate),
          p.timeSpentMinutes
        ),
      },
    }));

    const allProgress = [...weeklyProgress, ...monthlyProgress];
    return allProgress.filter(
      (p) =>
        new Date(p.date) >= dateRange.start && new Date(p.date) <= dateRange.end
    );
  }

  private calculateAverageScore(progress: PeriodicProgress[]): number {
    if (progress.length === 0) return 0;
    return (
      progress.reduce((sum, p) => sum + p.averageScore, 0) / progress.length
    );
  }

  private filterCategoriesProgress(
    categoryMetrics: Record<CategoryType, Category>,
    categories?: CategoryType[]
  ): Record<CategoryType, Category> {
    if (!categories || categories.length === 0) return categoryMetrics;
    return Object.fromEntries(
      Object.entries(categoryMetrics).filter(([category]) =>
        categories.includes(category as CategoryType)
      )
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
        totalLessonsCompleted: filteredProgress.reduce(
          (sum, p) => sum + p.lessonsCompleted,
          0
        ),
        totalExercisesCompleted: filteredProgress.reduce(
          (sum, p) => sum + p.exercisesCompleted,
          0
        ),
        averageScore: this.calculateAverageScore(filteredProgress),
        totalTimeSpent: filteredProgress.reduce(
          (sum, p) => sum + p.timeSpentMinutes,
          0
        ),
      },
      categoryProgress: this.filterCategoriesProgress(
        statistics.categoryMetrics,
        categories
      ),
      timeline: filteredProgress.map((p) => ({
        date: p.date,
        lessonsCompleted: p.lessonsCompleted,
        exercisesCompleted: p.exercisesCompleted,
        averageScore: p.averageScore,
        timeSpentMinutes: p.timeSpentMinutes,
      })),
    };
  }

  private async generateAchievementsReport(
    statistics: Statistics,
    dateRange: { start: Date; end: Date }
  ): Promise<any> {
    return {
      totalAchievements: statistics.achievementStats.totalAchievements,
      achievementsByCategory:
        statistics.achievementStats.achievementsByCategory,
      recentAchievements: {
        count: this.countAchievementsInRange(statistics, dateRange),
        lastAchieved: statistics.achievementStats.lastAchievementDate,
      },
      badgeProgress: {
        totalBadges: statistics.badgeStats.totalBadges,
        badgesByTier: statistics.badgeStats.badgesByTier,
        lastBadgeEarned: statistics.badgeStats.lastBadgeDate,
      },
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
          longest: statistics.learningMetrics.longestStreak,
        },
      },
      strengthAreas: this.filterAreasByCategories(
        statistics.strengthAreas,
        categories
      ),
      improvementAreas: this.filterAreasByCategories(
        statistics.improvementAreas,
        categories
      ),
      progressTrends: this.calculateProgressTrends(statistics, dateRange),
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
      this.generatePerformanceReport(statistics, dateRange, categories),
    ]);

    return {
      learningProgress,
      achievements,
      performance,
      recommendations: this.generateRecommendations(
        statistics.categoryMetrics[CategoryType.VOCABULARY]
      ),
    };
  }

  private getDateRange(
    timeFrame: TimeFrame,
    startDate?: Date,
    endDate?: Date
  ): { start: Date; end: Date } {
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
        if (!startDate)
          throw new Error("Start date is required for custom time frame");
        start = new Date(startDate);
        break;
    }

    return { start, end };
  }

  private filterAreasByCategories(
    areas: Area[],
    categories?: CategoryType[]
  ): AreaDto[] {
    if (!categories || categories.length === 0)
      return areas.map((area) => AreaDto.fromArea(area));
    return areas
      .filter((area) => categories.includes(area.category))
      .map((area) => AreaDto.fromArea(area));
  }

  private countAchievementsInRange(
    statistics: Statistics,
    dateRange: { start: Date; end: Date }
  ): number {
    const lastAchievement = new Date(
      statistics.achievementStats.lastAchievementDate
    );
    return lastAchievement >= dateRange.start &&
      lastAchievement <= dateRange.end
      ? 1
      : 0;
  }

  private calculateProgressTrends(
    statistics: Statistics,
    dateRange: { start: Date; end: Date }
  ): any {
    const progress = this.filterProgressByDate(statistics, dateRange);

    if (progress.length < 2) {
      return {
        trend: "insufficient_data",
        message: "Se necesitan más datos para generar tendencias precisas",
      };
    }

    // Calcular métricas de progreso
    const progressMetrics = {
      scoreProgress: this.calculateScoreProgress(progress),
      activityMetrics: this.calculateActivityMetrics(progress),
      timeInvestment: this.calculateTimeInvestment(progress),
      consistencyMetrics: this.calculateConsistencyMetrics(progress),
      milestones: this.identifyMilestones(statistics, dateRange),
    };

    return {
      overview: {
        trend: this.determineTrendDirection(progressMetrics),
        confidence: this.calculateTrendConfidence(progress),
        summary: this.generateTrendSummary(progressMetrics),
      },
      details: progressMetrics,
      recommendations: this.generateProgressRecommendations(progressMetrics),
    };
  }

  private calculateScoreProgress(progress: PeriodicProgress[]): any {
    const scores = progress.map((p) => p.averageScore);
    const firstScore = scores[0];
    const lastScore = scores[scores.length - 1];
    const improvement = ((lastScore - firstScore) / firstScore) * 100;

    // Calcular tendencia lineal
    const trendLine = this.calculateLinearRegression(
      scores.map((score, index) => ({ x: index, y: score }))
    );

    return {
      startScore: firstScore,
      endScore: lastScore,
      improvement: improvement,
      trendLineSlope: trendLine.slope,
      volatility: this.calculateVolatility(scores),
      consistentImprovement:
        trendLine.slope > 0 && this.isConsistentImprovement(scores),
    };
  }

  private calculateActivityMetrics(progress: PeriodicProgress[]): any {
    const activities = progress.map((p) => ({
      total: p.lessonsCompleted + p.exercisesCompleted,
      date: p.date,
    }));

    const averageActivities =
      activities.reduce((sum, day) => sum + day.total, 0) / activities.length;
    const activeStreak = this.calculateActiveStreak(activities);

    return {
      averageActivitiesPerPeriod: averageActivities,
      totalActivities: activities.reduce((sum, day) => sum + day.total, 0),
      activeStreak: activeStreak,
      activityDistribution: this.calculateActivityDistribution(activities),
      engagementScore: this.calculateEngagementScore(
        activities,
        averageActivities
      ),
    };
  }

  private calculateTimeInvestment(progress: PeriodicProgress[]): any {
    const timeData = progress.map((p) => ({
      minutes: p.timeSpentMinutes,
      date: p.date,
    }));

    const totalTime = timeData.reduce((sum, day) => sum + day.minutes, 0);
    const averageTime = totalTime / timeData.length;

    return {
      totalTimeSpent: totalTime,
      averageTimePerPeriod: averageTime,
      timeEfficiency: this.calculateTimeEfficiency(progress),
      timeDistribution: this.calculateTimeDistribution(
        timeData,
        timeData.reduce((sum, t) => sum + t.minutes, 0)
      ),
      consistencyScore: this.calculateTimeConsistency(timeData),
    };
  }

  private calculateConsistencyMetrics(progress: PeriodicProgress[]): any {
    return {
      scoreConsistency: this.calculateConsistencyScore(progress),
      activityRegularity: this.calculateActivityRegularity(progress),
      timeCommitment: this.calculateTimeCommitmentScore(progress),
      overallConsistency: this.calculateOverallConsistency(progress),
    };
  }

  private calculateLinearRegression(points: { x: number; y: number }[]): {
    slope: number;
    intercept: number;
  } {
    const n = points.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    for (const point of points) {
      sumX += point.x;
      sumY += point.y;
      sumXY += point.x * point.y;
      sumXX += point.x * point.x;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  private calculateVolatility(scores: number[]): number {
    if (scores.length < 2) return 0;
    const differences = scores
      .slice(1)
      .map((score, i) => Math.abs(score - scores[i]));
    return (
      differences.reduce((sum, diff) => sum + diff, 0) / differences.length
    );
  }

  private isConsistentImprovement(scores: number[]): boolean {
    let improvements = 0;
    let declines = 0;

    for (let i = 1; i < scores.length; i++) {
      if (scores[i] > scores[i - 1]) improvements++;
      else if (scores[i] < scores[i - 1]) declines++;
    }

    return improvements > declines * 2; // Al menos el doble de mejoras que declives
  }

  private calculateActiveStreak(
    activities: { total: number; date: string }[]
  ): number {
    let currentStreak = 0;
    let maxStreak = 0;

    for (let i = 0; i < activities.length; i++) {
      if (activities[i].total > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return maxStreak;
  }

  private calculateActivityDistribution(
    activities: { total: number; date: string }[]
  ): any {
    const distribution = activities.reduce(
      (acc, activity) => {
        const dayOfWeek = new Date(activity.date).getDay();
        acc[dayOfWeek] = (acc[dayOfWeek] || 0) + activity.total;
        return acc;
      },
      {} as Record<number, number>
    );

    return {
      byDayOfWeek: distribution,
      mostActiveDay: this.findMostActiveDay(distribution),
      leastActiveDay: this.findLeastActiveDay(distribution),
    };
  }

  private findMostActiveDay(distribution: Record<number, number>): string {
    const days = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const maxDay = Object.entries(distribution).reduce((max, [day, count]) =>
      count > distribution[parseInt(max[0])] ? [day, count] : max
    );
    return days[parseInt(maxDay[0])];
  }

  private findLeastActiveDay(distribution: Record<number, number>): string {
    const days = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const minDay = Object.entries(distribution).reduce((min, [day, count]) =>
      count < distribution[parseInt(min[0])] ? [day, count] : min
    );
    return days[parseInt(minDay[0])];
  }

  private calculateEngagementScore(
    activities: { total: number; date: string }[],
    averageActivities: number
  ): number {
    const consistencyFactor = this.calculateActivityConsistency(activities);
    const volumeFactor = Math.min(averageActivities / 5, 1); // Normalizado a 5 actividades por día
    return Math.round((consistencyFactor * 0.6 + volumeFactor * 0.4) * 100);
  }

  private calculateActivityConsistency(
    activities: { total: number; date: string }[]
  ): number {
    const activityCounts = activities.map((a) => a.total);
    const mean =
      activityCounts.reduce((sum, count) => sum + count, 0) /
      activityCounts.length;
    const variance =
      activityCounts.reduce(
        (sum, count) => sum + Math.pow(count - mean, 2),
        0
      ) / activityCounts.length;
    return Math.max(0, 1 - Math.sqrt(variance) / mean);
  }

  private calculateTimeEfficiency(progress: PeriodicProgress[]): number {
    const scorePerMinute = progress.map((p) => {
      if (p.timeSpentMinutes === 0) return 0;
      return (
        (p.averageScore * (p.lessonsCompleted + p.exercisesCompleted)) /
        p.timeSpentMinutes
      );
    });

    return (
      scorePerMinute.reduce((sum, efficiency) => sum + efficiency, 0) /
      scorePerMinute.length
    );
  }

  private calculateTimeConsistency(
    timeData: { minutes: number; date: string }[]
  ): number {
    const times = timeData.map((t) => t.minutes);
    const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
    const variance =
      times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) /
      times.length;
    return Math.max(0, 100 - (Math.sqrt(variance) / mean) * 50);
  }

  private identifyMilestones(
    statistics: Statistics,
    dateRange: { start: Date; end: Date }
  ): any {
    const milestones = [];
    const progress = this.filterProgressByDate(statistics, dateRange);

    // Identificar hitos significativos
    if (progress.length > 0) {
      const lastProgress = progress[progress.length - 1];
      const totalActivities =
        lastProgress.lessonsCompleted + lastProgress.exercisesCompleted;

      if (totalActivities >= 100) milestones.push("100_activities_completed");
      if (lastProgress.averageScore >= 90) milestones.push("90_percent_score");
      if (statistics.learningMetrics.currentStreak >= 7)
        milestones.push("week_long_streak");
    }

    return {
      achieved: milestones,
      next: this.calculateNextMilestones(statistics, milestones),
    };
  }

  private calculateNextMilestones(
    statistics: Statistics,
    achievedMilestones: string[]
  ): any[] {
    const nextMilestones = [];
    const metrics = statistics.learningMetrics;

    // Definir próximos hitos alcanzables
    if (!achievedMilestones.includes("100_activities_completed")) {
      const totalActivities =
        metrics.totalLessonsCompleted + metrics.totalExercisesCompleted;
      if (totalActivities < 100) {
        nextMilestones.push({
          type: "100_activities_completed",
          progress: (totalActivities / 100) * 100,
          remaining: 100 - totalActivities,
        });
      }
    }

    if (
      !achievedMilestones.includes("90_percent_score") &&
      metrics.averageScore < 90
    ) {
      nextMilestones.push({
        type: "90_percent_score",
        progress: (metrics.averageScore / 90) * 100,
        remaining: 90 - metrics.averageScore,
      });
    }

    return nextMilestones;
  }

  private determineTrendDirection(metrics: any): string {
    const scoreImproving = metrics.scoreProgress.improvement > 0;
    const consistentActivity = metrics.activityMetrics.engagementScore > 70;
    const goodTimeInvestment = metrics.timeInvestment.timeEfficiency > 0.5;

    if (scoreImproving && consistentActivity && goodTimeInvestment)
      return "strong_improvement";
    if (scoreImproving && (consistentActivity || goodTimeInvestment))
      return "moderate_improvement";
    if (scoreImproving) return "slight_improvement";
    if (!scoreImproving && !consistentActivity) return "declining";
    return "stable";
  }

  private calculateTrendConfidence(progress: PeriodicProgress[]): number {
    const dataPoints = progress.length;
    const consistency = this.calculateConsistencyScore(progress);
    const coverage = Math.min(dataPoints / 30, 1); // Normalizado a 30 días

    return Math.round((consistency * 0.7 + coverage * 0.3) * 100);
  }

  private generateTrendSummary(metrics: any): string {
    const { scoreProgress, activityMetrics, timeInvestment } = metrics;

    if (scoreProgress.consistentImprovement) {
      return `Mejora consistente con un incremento del ${scoreProgress.improvement.toFixed(1)}% en el puntaje promedio`;
    } else if (scoreProgress.improvement > 0) {
      return `Progreso positivo pero variable, con oportunidades de mejora en consistencia`;
    } else {
      return `Se recomienda aumentar la frecuencia de práctica para mejorar el rendimiento`;
    }
  }

  private generateProgressRecommendations(metrics: any): string[] {
    const recommendations: string[] = [];

    // Recomendaciones basadas en puntaje
    if (metrics.scoreProgress.volatility > 20) {
      recommendations.push(
        "Enfócate en mantener un rendimiento más consistente en tus ejercicios"
      );
    }

    // Recomendaciones basadas en actividad
    if (metrics.activityMetrics.engagementScore < 70) {
      recommendations.push("Intenta establecer un horario regular de práctica");
    }

    // Recomendaciones basadas en tiempo
    if (metrics.timeInvestment.timeEfficiency < 0.5) {
      recommendations.push(
        "Considera dividir tus sesiones de práctica en períodos más cortos y focalizados"
      );
    }

    return recommendations;
  }

  private calculateConsistencyScore(progress: PeriodicProgress[]): number {
    if (progress.length < 2) return 0;

    const scores = progress.map((p) => p.averageScore);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance =
      scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) /
      scores.length;

    // Normalizar la puntuación de consistencia (0-100)
    return Math.max(0, 100 - Math.sqrt(variance) * 10);
  }

  private calculateActivityRegularity(progress: PeriodicProgress[]): number {
    if (progress.length < 2) return 0;

    // Calcular la regularidad basada en la desviación de actividades diarias
    const dailyActivities = progress.map(
      (p) => p.lessonsCompleted + p.exercisesCompleted
    );
    const gaps = dailyActivities.slice(1).map((activities, i) => {
      const prevActivities = dailyActivities[i];
      return Math.abs(activities - prevActivities);
    });

    const averageGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length;
    const maxAllowedGap = 5; // Máxima diferencia permitida para considerar actividad regular

    // Normalizar a una escala de 0-100
    return Math.max(0, 100 - (averageGap / maxAllowedGap) * 100);
  }

  private calculateTimeCommitmentScore(progress: PeriodicProgress[]): number {
    if (progress.length === 0) return 0;

    // Calcular puntuación basada en tiempo invertido y consistencia
    const dailyMinutes = progress.map((p) => p.timeSpentMinutes);
    const totalMinutes = dailyMinutes.reduce(
      (sum, minutes) => sum + minutes,
      0
    );
    const averageMinutes = totalMinutes / progress.length;

    // Factores de puntuación
    const targetDailyMinutes = 30; // Tiempo objetivo diario en minutos
    const quantityScore = Math.min(averageMinutes / targetDailyMinutes, 1) * 50;

    // Calcular consistencia en el tiempo invertido
    const variance =
      dailyMinutes.reduce(
        (sum, minutes) => sum + Math.pow(minutes - averageMinutes, 2),
        0
      ) / progress.length;
    const standardDeviation = Math.sqrt(variance);
    const consistencyScore = Math.max(
      0,
      50 - (standardDeviation / targetDailyMinutes) * 25
    );

    return Math.round(quantityScore + consistencyScore);
  }

  private calculateOverallConsistency(progress: PeriodicProgress[]): number {
    if (progress.length < 2) return 0;

    // Combinar diferentes aspectos de consistencia
    const scoreConsistency = this.calculateConsistencyScore(progress);
    const activityRegularity = this.calculateActivityRegularity(progress);
    const timeCommitment = this.calculateTimeCommitmentScore(progress);

    // Pesos para cada factor
    const weights = {
      scoreConsistency: 0.4,
      activityRegularity: 0.3,
      timeCommitment: 0.3,
    };

    // Calcular puntuación ponderada
    const weightedScore =
      scoreConsistency * weights.scoreConsistency +
      activityRegularity * weights.activityRegularity +
      timeCommitment * weights.timeCommitment;

    // Factores de bonificación
    const streakBonus = this.calculateStreakBonus(progress);
    const regularityBonus = this.calculateRegularityBonus(progress);

    // Aplicar bonificaciones (máximo 20% adicional)
    const bonusScore =
      weightedScore * Math.min(streakBonus + regularityBonus, 0.2);

    return Math.round(Math.min(weightedScore + bonusScore, 100));
  }

  private calculateStreakBonus(progress: PeriodicProgress[]): number {
    // Calcular bonus por racha de actividad continua
    let currentStreak = 0;
    let maxStreak = 0;

    for (let i = 0; i < progress.length; i++) {
      const hasActivity =
        progress[i].lessonsCompleted > 0 || progress[i].exercisesCompleted > 0;

      if (hasActivity) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    // Bonus máximo de 10% por rachas largas
    return Math.min(maxStreak / 30, 0.1);
  }

  private calculateRegularityBonus(progress: PeriodicProgress[]): number {
    if (progress.length < 7) return 0;

    // Analizar patrones de actividad semanal
    const weekdayActivity = new Array(7).fill(0);
    let totalDays = 0;

    progress.forEach((p) => {
      const dayOfWeek = new Date(p.date).getDay();
      if (p.lessonsCompleted > 0 || p.exercisesCompleted > 0) {
        weekdayActivity[dayOfWeek]++;
        totalDays++;
      }
    });

    // Calcular la regularidad semanal
    const weeksInPeriod = progress.length / 7;
    const activeDaysPerWeek = totalDays / weeksInPeriod;
    const consistentDays = weekdayActivity.filter(
      (days) => days / weeksInPeriod > 0.7
    ).length;

    // Bonus máximo de 10% por regularidad semanal
    return Math.min((consistentDays / 7) * (activeDaysPerWeek / 5), 0.1);
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
      (currentAverage * (totalExercises - exercisesCompleted) + score) /
      totalExercises;

    // Actualizar fecha de última práctica y racha
    const now = new Date();
    const lastPracticed = category.progress.lastPracticed
      ? new Date(category.progress.lastPracticed)
      : null;

    if (lastPracticed) {
      const dayDiff = Math.floor(
        (now.getTime() - lastPracticed.getTime()) / (1000 * 60 * 60 * 24)
      );
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
      category.progress.averageScore * 0.4 +
        (Math.min(category.progress.streak, 30) / 30) * 0.3 +
        (Math.min(category.progress.completedExercises, 100) / 100) * 0.3
    );
    category.progress.masteryLevel = newMasteryLevel;

    // Actualizar áreas fuertes y de mejora
    await this.updateAreas(statistics);

    // Guardar cambios
    statistics.categoryMetrics = categoryMetrics;
    return this.statisticsRepository.save(statistics);
  }

  private calculateDailyGoalsAchieved(statistics: Statistics): number {
    const today = new Date();
    const dailyGoals = statistics.learningPath.customGoals.filter(
      (goal) => goal.frequency === "daily" && new Date(goal.deadline) >= today
    );

    return dailyGoals.filter((goal) => this.isGoalAchieved(statistics, goal))
      .length;
  }

  private getDailyGoalsTotal(statistics: Statistics): number {
    const today = new Date();
    return statistics.learningPath.customGoals.filter(
      (goal) => goal.frequency === "daily" && new Date(goal.deadline) >= today
    ).length;
  }

  private calculateWeeklyGoalsAchieved(statistics: Statistics): number {
    const today = new Date();
    const weeklyGoals = statistics.learningPath.customGoals.filter(
      (goal) => goal.frequency === "weekly" && new Date(goal.deadline) >= today
    );

    return weeklyGoals.filter((goal) => this.isGoalAchieved(statistics, goal))
      .length;
  }

  private getWeeklyGoalsTotal(statistics: Statistics): number {
    const today = new Date();
    return statistics.learningPath.customGoals.filter(
      (goal) => goal.frequency === "weekly" && new Date(goal.deadline) >= today
    ).length;
  }

  private calculateMonthlyGoalsAchieved(statistics: Statistics): number {
    const today = new Date();
    const monthlyGoals = statistics.learningPath.customGoals.filter(
      (goal) => goal.frequency === "monthly" && new Date(goal.deadline) >= today
    );

    return monthlyGoals.filter((goal) => this.isGoalAchieved(statistics, goal))
      .length;
  }

  private getMonthlyGoalsTotal(statistics: Statistics): number {
    const today = new Date();
    return statistics.learningPath.customGoals.filter(
      (goal) => goal.frequency === "monthly" && new Date(goal.deadline) >= today
    ).length;
  }

  private calculateImprovementRate(
    statistics: Statistics,
    monthlyProgress: MonthlyProgress
  ): number {
    const previousMonth = new Date(monthlyProgress.monthStartDate);
    previousMonth.setMonth(previousMonth.getMonth() - 1);

    const previousMonthProgress = statistics.monthlyProgress.find((p) =>
      this.isSameMonth(new Date(p.monthStartDate), previousMonth)
    );

    if (!previousMonthProgress) return 0;

    const scoreDiff =
      monthlyProgress.averageScore - previousMonthProgress.averageScore;
    const activityDiff =
      monthlyProgress.lessonsCompleted +
      monthlyProgress.exercisesCompleted -
      (previousMonthProgress.lessonsCompleted +
        previousMonthProgress.exercisesCompleted);

    // Calcular tasa de mejora ponderada (60% puntuación, 40% actividad)
    return (
      (scoreDiff * 0.6 +
        (activityDiff /
          Math.max(
            1,
            previousMonthProgress.lessonsCompleted +
              previousMonthProgress.exercisesCompleted
          )) *
          0.4) *
      100
    );
  }

  private isGoalAchieved(statistics: Statistics, goal: any): boolean {
    switch (goal.type) {
      case "score":
        return statistics.learningMetrics.averageScore >= goal.target;
      case "exercises":
        return (
          statistics.learningMetrics.totalExercisesCompleted >= goal.target
        );
      case "time":
        return statistics.learningMetrics.totalTimeSpentMinutes >= goal.target;
      case "streak":
        return statistics.learningMetrics.currentStreak >= goal.target;
      default:
        return false;
    }
  }

  private findPeakHours(distribution: Record<string, number>): number[] {
    const average =
      Object.values(distribution).reduce((sum, minutes) => sum + minutes, 0) /
      24;
    return Object.entries(distribution)
      .filter(([_, minutes]) => minutes > average * 1.5)
      .map(([hour]) => parseInt(hour));
  }

  private determinePreferredTimeOfDay(
    distribution: Record<string, number>
  ): string {
    const timeSlots = {
      morning: [6, 7, 8, 9, 10, 11],
      afternoon: [12, 13, 14, 15, 16, 17],
      evening: [18, 19, 20, 21],
      night: [22, 23, 0, 1, 2, 3, 4, 5],
    };

    const slotTotals = Object.entries(timeSlots).map(([slot, hours]) => ({
      slot,
      total: hours.reduce((sum, hour) => sum + (distribution[hour] || 0), 0),
    }));

    return slotTotals.reduce((max, slot) =>
      slot.total > max.total ? slot : max
    ).slot;
  }

  async getUserStatistics(userId: string): Promise<UserStatistics> {
    const userLevel = await this.userLevelRepository.findOne({
      where: { user: { id: userId } },
    });

    const userStats = await this.statisticsRepository.findOne({
      where: { userId },
    });

    return {
      gamification: {
        points: userLevel?.points || 0,
        level: userLevel?.level || 1,
        gameStats: {}, // No hay gameStats en UserLevel
        achievements: [], // No hay achievements en UserLevel
        rewards: [], // No hay rewards en UserLevel
        culturalPoints: 0, // No hay culturalPoints en UserLevel
      },
      learning: {
        completedLessons: userStats?.learningMetrics.totalLessonsCompleted || 0,
        totalLessons: userStats?.learningMetrics.totalLessonsCompleted || 0,
        averageScore: userStats?.learningMetrics.averageScore || 0,
        timeSpent: userStats?.learningMetrics.totalTimeSpentMinutes || 0,
      },
    };
  }

  async updateUserStatistics(userId: string, data: Partial<Statistics>) {
    let stats = await this.statisticsRepository.findOne({
      where: { userId },
    });

    if (!stats) {
      stats = this.statisticsRepository.create({
        userId,
        ...data,
      });
    } else {
      Object.assign(stats, data);
    }

    return await this.statisticsRepository.save(stats);
  }

  async updateStrengthAndImprovementAreas(userId: string): Promise<void> {
    const statistics = await this.findByUserId(userId);
    if (!statistics) {
      throw new Error("Statistics not found");
    }

    const now = new Date();
    const scores = Object.entries(
      statistics.categoryMetrics as Record<CategoryType, Category>
    )
      .map(([type, category]) =>
        this.mapCategoryToArea(type as CategoryType, category as Category)
      )
      .sort((a, b) => b.score - a.score);

    const totalCategories = scores.length;
    const strengthCount = Math.ceil(totalCategories * 0.3); // Top 30%
    const improvementCount = Math.ceil(totalCategories * 0.3); // Bottom 30%

    statistics.strengthAreas = scores.slice(0, strengthCount);
    statistics.improvementAreas = scores.slice(-improvementCount).reverse();

    await this.statisticsRepository.save(statistics);
  }

  private updateDateFields(statistics: Statistics): void {
    if (statistics.achievementStats) {
      statistics.achievementStats.lastAchievementDate =
        new Date().toISOString();
    }
    if (statistics.badgeStats) {
      statistics.badgeStats.lastBadgeDate = new Date().toISOString();
    }
  }

  private createProgressEntry(date: Date): WeeklyProgress {
    return {
      week: date.toISOString().split("T")[0],
      weekStartDate: date.toISOString(),
      weeklyGoalsAchieved: 0,
      weeklyGoalsTotal: 0,
      lessonsCompleted: 0,
      exercisesCompleted: 0,
      averageScore: 0,
      timeSpentMinutes: 0,
      consistencyMetrics: {
        daysActive: 0,
        totalSessions: 0,
        averageSessionDuration: 0,
        preferredTimeOfDay: "morning",
        regularityScore: 0,
        dailyStreak: 0,
        weeklyCompletion: 0,
        timeDistribution: {},
      },
    };
  }

  private convertToAreaDto(area: Area): AreaDto {
    return AreaDto.fromArea(area);
  }

  private convertToArea(dto: AreaDto): Area {
    return dto.toArea();
  }

  async updateStatistics(
    userId: string,
    updates: Partial<Statistics>
  ): Promise<Statistics> {
    const statistics = await this.findOne(userId);
    if (!statistics) {
      throw new NotFoundException(`Statistics not found for user ${userId}`);
    }

    this.updateDateFields(statistics);

    if (updates.strengthAreas) {
      statistics.strengthAreas = updates.strengthAreas.map((area) =>
        this.convertToAreaDto(area)
      );
    }
    if (updates.improvementAreas) {
      statistics.improvementAreas = updates.improvementAreas.map((area) =>
        this.convertToAreaDto(area)
      );
    }

    return this.statisticsRepository.save({
      ...statistics,
      ...updates,
    });
  }

  private createBaseProgress(): BaseProgress {
    return {
      lessonsCompleted: 0,
      exercisesCompleted: 0,
      averageScore: 0,
      timeSpentMinutes: 0,
      consistencyMetrics: {
        daysActive: 0,
        totalSessions: 0,
        averageSessionDuration: 0,
        preferredTimeOfDay: "morning",
        regularityScore: 0,
        dailyStreak: 0,
        weeklyCompletion: 0,
        timeDistribution: {},
      },
    };
  }
}
