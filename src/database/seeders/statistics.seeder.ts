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

    // Obtener más usuarios existentes para asociar estadísticas
    const users = await userRepository.find({ take: 10 }); // Obtener los primeros 10 usuarios

    const statisticsPlainData = users.map(user => {
      const now = new Date().toISOString();
      const categories = Object.values(CategoryType);
      const difficulties = Object.values(CategoryDifficulty);
      const statuses = Object.values(CategoryStatus);
      const goalTypes = Object.values(GoalType);
      const frequencyTypes = Object.values(FrequencyType);

      const categoryMetrics: any = {};
      categories.forEach(category => {
        const isAvailable = Math.random() > 0.2; // 80% de probabilidad de estar disponible
        const status = isAvailable ? statuses[Math.floor(Math.random() * statuses.length)] : CategoryStatus.LOCKED;
        const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        const totalExercises = Math.floor(Math.random() * 50) + 10;
        const completedExercises = status === CategoryStatus.COMPLETED ? totalExercises : Math.floor(Math.random() * totalExercises);
        const averageScore = completedExercises > 0 ? Math.floor(Math.random() * 41) + 60 : 0;
        const timeSpentMinutes = completedExercises * (Math.floor(Math.random() * 5) + 2);
        const lastPracticed = completedExercises > 0 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null;
        const masteryLevel = completedExercises / totalExercises;
        const streak = Math.floor(Math.random() * 15);

        categoryMetrics[category] = {
          type: category,
          difficulty: difficulty,
          status: status,
          progress: {
            totalExercises,
            completedExercises,
            averageScore,
            timeSpentMinutes,
            lastPracticed,
            masteryLevel,
            streak,
          },
        };
      });

      const strengthAreas = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => ({
        name: categories[Math.floor(Math.random() * categories.length)],
        score: Math.floor(Math.random() * 21) + 80, // Puntuación alta
      }));

      const improvementAreas = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => ({
        name: categories[Math.floor(Math.random() * categories.length)],
        score: Math.floor(Math.random() * 31) + 40, // Puntuación media-baja
      }));

      const totalLessonsCompleted = Math.floor(Math.random() * 50);
      const totalExercisesCompleted = Math.floor(Math.random() * 200);
      const averageScore = totalExercisesCompleted > 0 ? Math.floor(Math.random() * 41) + 60 : 0;
      const totalTimeSpentMinutes = totalLessonsCompleted * 15 + totalExercisesCompleted * 5;
      const longestStreak = Math.floor(Math.random() * 30);
      const currentStreak = Math.floor(Math.random() * longestStreak);
      const lastActivityDate = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
      const totalMasteryScore = Math.floor(Math.random() * 101);

      const weeklyProgress = Array.from({ length: Math.floor(Math.random() * 4) + 1 }).map((_, index) => {
        const week = `2025-W${14 + index}`;
        const lessonsCompleted = Math.floor(Math.random() * 5);
        const exercisesCompleted = Math.floor(Math.random() * 20);
        const averageScore = exercisesCompleted > 0 ? Math.floor(Math.random() * 41) + 60 : 0;
        const timeSpentMinutes = lessonsCompleted * 15 + exercisesCompleted * 5;
        return { week, lessonsCompleted, exercisesCompleted, averageScore, timeSpentMinutes };
      });

      const monthlyProgress = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map((_, index) => {
        const month = `2025-${(3 + index).toString().padStart(2, '0')}`;
        const lessonsCompleted = Math.floor(Math.random() * 10);
        const exercisesCompleted = Math.floor(Math.random() * 40);
        const averageScore = exercisesCompleted > 0 ? Math.floor(Math.random() * 41) + 60 : 0;
        const timeSpentMinutes = lessonsCompleted * 15 + exercisesCompleted * 5;
        return { month, lessonsCompleted, exercisesCompleted, averageScore, timeSpentMinutes };
      });

      const periodicProgress = categories.filter(() => Math.random() > 0.5).map(category => {
        const lessonsCompleted = Math.floor(Math.random() * 10);
        const exercisesCompleted = Math.floor(Math.random() * 30);
        const averageScore = exercisesCompleted > 0 ? Math.floor(Math.random() * 41) + 60 : 0;
        const timeSpentMinutes = lessonsCompleted * 15 + exercisesCompleted * 5;
        return { category, lessonsCompleted, exercisesCompleted, averageScore, timeSpentMinutes };
      });

      const totalAchievements = Math.floor(Math.random() * 10);
      const achievementCategories = ['learning', 'social', 'cultural'];
      const achievementsByCategory: any = {};
      achievementCategories.forEach(cat => achievementsByCategory[cat] = Math.floor(Math.random() * (totalAchievements / achievementCategories.length)));
      const lastAchievementDate = totalAchievements > 0 ? new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString() : null;
      const specialAchievements = Array.from({ length: Math.floor(Math.random() * 3) }).map(() => `Logro Especial ${Math.floor(Math.random() * 5) + 1}`);

      const totalBadges = Math.floor(Math.random() * 5);
      const badgeTiers = ['bronze', 'silver', 'gold'];
      const badgesByTier: any = {};
      badgeTiers.forEach(tier => badgesByTier[tier] = Math.floor(Math.random() * (totalBadges / badgeTiers.length)));
      const lastBadgeDate = totalBadges > 0 ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString() : null;
      const activeBadges = Array.from({ length: Math.floor(Math.random() * 2) }).map(() => `Insignia Activa ${Math.floor(Math.random() * 3) + 1}`);


      const currentLevel = Math.floor(Math.random() * 20) + 1;
      const recommendedCategories = categories.filter(() => Math.random() > 0.5);
      const nextMilestones = Array.from({ length: Math.floor(Math.random() * 3) }).map(() => ({
        category: categories[Math.floor(Math.random() * categories.length)],
        name: `Hito ${Math.floor(Math.random() * 5) + 1}`,
        requiredProgress: 100,
        currentProgress: Math.floor(Math.random() * 100),
      }));
      const customGoals = Array.from({ length: Math.floor(Math.random() * 2) }).map((_, index) => ({
        id: `goal-${index + 1}`,
        type: goalTypes[Math.floor(Math.random() * goalTypes.length)],
        target: Math.floor(Math.random() * 50) + 10,
        frequency: frequencyTypes[Math.floor(Math.random() * frequencyTypes.length)],
        deadline: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: `Meta personalizada ${index + 1}`,
        isCompleted: Math.random() > 0.7, // Menor probabilidad de estar completada
      }));


      return { // Crear objeto plano
        userId: user.id,
        categoryMetrics,
        strengthAreas,
        improvementAreas,
        learningMetrics: {
          totalLessonsCompleted,
          totalExercisesCompleted,
          averageScore,
          totalTimeSpentMinutes,
          longestStreak,
          currentStreak,
          lastActivityDate,
          totalMasteryScore,
        },
        weeklyProgress,
        monthlyProgress,
        periodicProgress,
        achievementStats: {
          totalAchievements,
          achievementsByCategory,
          lastAchievementDate,
          specialAchievements,
        },
        badgeStats: {
          totalBadges,
          badgesByTier,
          lastBadgeDate,
          activeBadges,
        },
        learningPath: {
          currentLevel,
          recommendedCategories,
          nextMilestones,
          customGoals,
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
