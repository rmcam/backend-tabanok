import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { Statistics } from '../../features/statistics/entities/statistics.entity';
import { User } from '../../auth/entities/user.entity';
import {
  CategoryDifficulty,
  CategoryStatus,
  CategoryType,
  FrequencyType,
  GoalType,
} from '../../features/statistics/types/category.enum';

export class StatisticsSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const statisticsRepository = this.dataSource.getRepository(Statistics);
    const userRepository = this.dataSource.getRepository(User);

    // Obtener algunos usuarios existentes para asociar estadísticas
    const users = await userRepository.find({ take: 5 }); // Obtener los primeros 5 usuarios

    const statisticsPlainData = users.map(user => {
      const now = new Date().toISOString();
      return { // Crear objeto plano
        userId: user.id,
        categoryMetrics: {
          [CategoryType.VOCABULARY]: {
            type: CategoryType.VOCABULARY,
            difficulty: CategoryDifficulty.BEGINNER,
            status: CategoryStatus.IN_PROGRESS,
            progress: {
              totalExercises: 20,
              completedExercises: 15,
              averageScore: 90,
              timeSpentMinutes: 60,
              lastPracticed: now,
              masteryLevel: 0.75,
              streak: 5,
            },
          },
          [CategoryType.GRAMMAR]: {
            type: CategoryType.GRAMMAR,
            difficulty: CategoryDifficulty.INTERMEDIATE,
            status: CategoryStatus.AVAILABLE, // Usar el enum directamente
            progress: {
              totalExercises: 0,
              completedExercises: 0,
              averageScore: 0,
              timeSpentMinutes: 0,
              lastPracticed: null,
              masteryLevel: 0,
              streak: 0,
            },
          },
          // Agregar métricas para otras categorías según sea necesario
        },
        strengthAreas: [
          { name: 'Vocabulario Básico', score: 95 },
          { name: 'Pronunciación', score: 88 },
        ],
        improvementAreas: [
          { name: 'Gramática Avanzada', score: 60 },
          { name: 'Comprensión Auditiva', score: 70 },
        ],
        learningMetrics: {
          totalLessonsCompleted: 10,
          totalExercisesCompleted: 50,
          averageScore: 88,
          totalTimeSpentMinutes: 300,
          longestStreak: 7,
          currentStreak: 5,
          lastActivityDate: now,
          totalMasteryScore: 75,
        },
        weeklyProgress: [
          { week: '2025-W14', lessonsCompleted: 2, exercisesCompleted: 10, averageScore: 80, timeSpentMinutes: 60 },
          { week: '2025-W15', lessonsCompleted: 3, exercisesCompleted: 15, averageScore: 85, timeSpentMinutes: 90 },
        ],
        monthlyProgress: [
          { month: '2025-03', lessonsCompleted: 5, exercisesCompleted: 25, averageScore: 82, timeSpentMinutes: 150 },
          { month: '2025-04', lessonsCompleted: 5, exercisesCompleted: 25, averageScore: 88, timeSpentMinutes: 150 },
        ],
        periodicProgress: [
          { category: CategoryType.VOCABULARY, lessonsCompleted: 5, exercisesCompleted: 20, averageScore: 90, timeSpentMinutes: 120 },
          { category: CategoryType.GRAMMAR, lessonsCompleted: 2, exercisesCompleted: 10, averageScore: 75, timeSpentMinutes: 60 },
        ],
        achievementStats: {
          totalAchievements: 5,
          achievementsByCategory: { 'learning': 3, 'social': 2 },
          lastAchievementDate: now,
          specialAchievements: ['Primer Lección Completada', 'Racha de 3 Días'],
        },
        badgeStats: {
          totalBadges: 3,
          badgesByTier: { 'bronze': 2, 'silver': 1 },
          lastBadgeDate: now,
          activeBadges: ['Explorador', 'Constante'],
        },
        learningPath: {
          currentLevel: 2,
          recommendedCategories: [CategoryType.GRAMMAR, CategoryType.PRONUNCIATION],
          nextMilestones: [
            { category: CategoryType.VOCABULARY, name: 'Vocabulario Intermedio', requiredProgress: 100, currentProgress: 75 },
          ],
          customGoals: [
            {
              id: 'goal-1',
              type: GoalType.EXERCISES,
              target: 30,
              frequency: FrequencyType.WEEKLY,
              deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Una semana desde ahora
              description: 'Completar 30 ejercicios de vocabulario esta semana',
              isCompleted: false,
            },
          ],
        },
        createdAt: now,
        updatedAt: now,
      };
    });

    // Eliminar estadísticas existentes para evitar duplicados
    await statisticsRepository.clear();

    // Crear entidades a partir de los objetos planos
    const statisticsEntities = statisticsRepository.create(statisticsPlainData);

    // Guardar las entidades
    await statisticsRepository.save(statisticsEntities);

    console.log('Statistics seeder finished.');
  }
}
