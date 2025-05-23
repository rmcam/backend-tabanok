import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed'; 
import { Statistics } from '../../features/statistics/entities/statistics.entity';
import { User } from '../../auth/entities/user.entity';
import {
  CategoryDifficulty,
  CategoryStatus,
  CategoryType,
  FrequencyType,
  GoalType,
} from '../../features/statistics/types/category.enum';
import { v4 as uuidv4 } from 'uuid';

export class StatisticsSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const statisticsRepository = this.dataSource.getRepository(Statistics);
    const userRepository = this.dataSource.getRepository(User);

    // Obtener todos los usuarios existentes para asociar estadísticas
    const users = await userRepository.find();

    const statisticsPlainData = users.map(user => {
      const now = new Date().toISOString();
      const categories = Object.values(CategoryType);
      const difficulties = Object.values(CategoryDifficulty);
      const statuses = Object.values(CategoryStatus);
      const goalTypes = Object.values(GoalType);
      const frequencyTypes = Object.values(FrequencyType);

      const categoryMetrics: any = {};
      let totalExercisesCompletedAcrossCategories = 0;
      let totalLessonsCompletedAcrossCategories = 0;
      let totalTimeSpentMinutesAcrossCategories = 0;
      let totalMasteryScoreAcrossCategories = 0;
      let completedCategoriesCount = 0;


      categories.forEach(category => {
        const isAvailable = Math.random() > 0.1; // 90% de probabilidad de estar disponible
        const status = isAvailable ? statuses[Math.floor(Math.random() * statuses.length)] : CategoryStatus.LOCKED;
        const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        const totalExercises = Math.floor(Math.random() * 80) + 20; // More exercises
        const completedExercises = status === CategoryStatus.COMPLETED ? totalExercises : Math.floor(Math.random() * totalExercises * (user.roles[0] === 'teacher' || user.roles[0] === 'admin' ? 0.8 : 0.5)); // Teachers/Admins complete more
        const averageScore = completedExercises > 0 ? Math.floor(Math.random() * 31) + 70 : 0; // Higher average score
        const timeSpentMinutes = completedExercises * (Math.floor(Math.random() * 7) + 3); // More time spent
        const lastPracticed = completedExercises > 0 ? new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString() : null; // Practice in last 60 days
        const masteryLevel = completedExercises / totalExercises;
        const streak = Math.floor(Math.random() * 30); // Longer streaks

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

        totalExercisesCompletedAcrossCategories += completedExercises;
        totalLessonsCompletedAcrossCategories += Math.floor(completedExercises / 5); // Estimate lessons based on exercises
        totalTimeSpentMinutesAcrossCategories += timeSpentMinutes;
        totalMasteryScoreAcrossCategories += masteryLevel * 100;
        if (status === CategoryStatus.COMPLETED) {
            completedCategoriesCount++;
        }
      });

      const strengthAreas = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => ({
        name: categories[Math.floor(Math.random() * categories.length)],
        score: Math.floor(Math.random() * 11) + 90, // Very high score
      }));

      const improvementAreas = Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(() => ({
        name: categories[Math.floor(Math.random() * categories.length)],
        score: Math.floor(Math.random() * 21) + 50, // Medium-low score
      }));

      const totalLessonsCompleted = totalLessonsCompletedAcrossCategories;
      const totalExercisesCompleted = totalExercisesCompletedAcrossCategories;
      const overallAverageScore = totalExercisesCompleted > 0 ? Math.floor(totalMasteryScoreAcrossCategories / categories.length) : 0;
      const totalTimeSpentMinutes = totalTimeSpentMinutesAcrossCategories;
      const longestStreak = Math.floor(Math.random() * 60); // Longer longest streak
      const currentStreak = Math.floor(Math.random() * longestStreak);
      const lastActivityDate = new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(); // Activity in last 14 days
      const totalMasteryScore = Math.floor(totalMasteryScoreAcrossCategories / categories.length);


      const weeklyProgress = Array.from({ length: Math.floor(Math.random() * 8) + 2 }).map((_, index) => { // More weeks of data
        const week = `2025-W${10 + index}`; // Start earlier
        const lessonsCompleted = Math.floor(Math.random() * 8);
        const exercisesCompleted = Math.floor(Math.random() * 30);
        const averageScore = exercisesCompleted > 0 ? Math.floor(Math.random() * 31) + 70 : 0;
        const timeSpentMinutes = lessonsCompleted * 20 + exercisesCompleted * 7; // More time per activity
        return { week, lessonsCompleted, exercisesCompleted, averageScore, timeSpentMinutes };
      });

      const monthlyProgress = Array.from({ length: Math.floor(Math.random() * 6) + 1 }).map((_, index) => { // More months of data
        const month = `2025-${(1 + index).toString().padStart(2, '0')}`; // Start earlier
        const lessonsCompleted = Math.floor(Math.random() * 15);
        const exercisesCompleted = Math.floor(Math.random() * 60);
        const averageScore = exercisesCompleted > 0 ? Math.floor(Math.random() * 31) + 70 : 0;
        const timeSpentMinutes = lessonsCompleted * 20 + exercisesCompleted * 7;
        return { month, lessonsCompleted, exercisesCompleted, averageScore, timeSpentMinutes };
      });

      const periodicProgress = categories.filter(() => Math.random() > 0.3).map(category => { // More categories in periodic progress
        const lessonsCompleted = Math.floor(Math.random() * 15);
        const exercisesCompleted = Math.floor(Math.random() * 40);
        const averageScore = exercisesCompleted > 0 ? Math.floor(Math.random() * 31) + 70 : 0;
        const timeSpentMinutes = lessonsCompleted * 20 + exercisesCompleted * 7;
        return { category, lessonsCompleted, exercisesCompleted, averageScore, timeSpentMinutes };
      });

      const totalAchievements = Math.floor(completedCategoriesCount * 1.5 + Math.random() * 5); // Achievements based on completed categories
      const achievementCategories = ['learning', 'social', 'cultural'];
      const achievementsByCategory: any = {};
      achievementCategories.forEach(cat => achievementsByCategory[cat] = Math.floor(totalAchievements / achievementCategories.length + Math.random() * 2));
      const lastAchievementDate = totalAchievements > 0 ? new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString() : null; // Achievements in last 90 days
      const specialAchievements = Array.from({ length: Math.floor(Math.random() * 4) }).map(() => `Logro Especial ${Math.floor(Math.random() * 10) + 1}`); // More special achievements

      const totalBadges = Math.floor(completedCategoriesCount * 0.8 + Math.random() * 3); // Badges based on completed categories
      const badgeTiers = ['bronze', 'silver', 'gold'];
      const badgesByTier: any = {};
      badgeTiers.forEach(tier => badgesByTier[tier] = Math.floor(totalBadges / badgeTiers.length + Math.random()));
      const lastBadgeDate = totalBadges > 0 ? new Date(Date.now() - Math.random() * 120 * 24 * 60 * 60 * 1000).toISOString() : null; // Badges in last 120 days
      const activeBadges = Array.from({ length: Math.floor(Math.random() * 3) }).map(() => `Insignia Activa ${Math.floor(Math.random() * 5) + 1}`); // More active badges


      const currentLevel = Math.floor(totalExercisesCompleted / 10 + totalLessonsCompleted / 3 + totalAchievements / 2 + totalBadges * 5) + 1; // Level based on progress and achievements
      const recommendedCategories = categories.filter(category => Math.random() > 0.3 && categoryMetrics[category].status !== CategoryStatus.COMPLETED); // Recommend incomplete categories
      const nextMilestones = Array.from({ length: Math.floor(Math.random() * 4) }).map(() => ({ // More milestones
        category: categories[Math.floor(Math.random() * categories.length)],
        name: `Hito ${Math.floor(Math.random() * 10) + 1}`,
        requiredProgress: 100,
        currentProgress: Math.floor(Math.random() * 100),
      }));
      const customGoals = Array.from({ length: Math.floor(Math.random() * 3) }).map((_, index) => ({ // More custom goals
        id: `goal-${index + 1}`,
        type: goalTypes[Math.floor(Math.random() * goalTypes.length)],
        target: Math.floor(Math.random() * 80) + 20, // Higher targets
        frequency: frequencyTypes[Math.floor(Math.random() * frequencyTypes.length)],
        deadline: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(), // Deadlines in next 60 days
        description: `Meta personalizada ${index + 1}`,
        isCompleted: Math.random() > 0.5, // Higher chance of being completed
      }));


      return { // Crear objeto plano
        id: uuidv4(),
        userId: user.id,
        categoryMetrics,
        strengthAreas,
        improvementAreas,
        learningMetrics: {
          totalLessonsCompleted,
          totalExercisesCompleted,
          averageScore: overallAverageScore,
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
