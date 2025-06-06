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

export class StatisticsSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const statisticsRepository = this.dataSource.getRepository(Statistics);
    const userRepository = this.dataSource.getRepository(User);

    // Obtener todos los usuarios existentes para asociar estadísticas
    const users = await userRepository.find();

    // Crear un registro de estadísticas inicial para cada usuario
    for (const user of users) {
      const existingStatistics = await statisticsRepository.findOne({ where: { userId: user.id } });

      if (!existingStatistics) {
        const now = new Date().toISOString();
        const categories = Object.values(CategoryType);

        const categoryMetrics: any = {};
        categories.forEach(category => {
          categoryMetrics[category] = {
            type: category,
            difficulty: CategoryDifficulty.BEGINNER, // Nivel inicial
            status: CategoryStatus.AVAILABLE, // Disponible inicialmente
            progress: {
              totalExercises: 0,
              completedExercises: 0,
              averageScore: 0,
              timeSpentMinutes: 0,
              lastPracticed: null,
              masteryLevel: 0,
              streak: 0,
            },
          };
        });

        const newStatistics = statisticsRepository.create({
          userId: user.id,
          categoryMetrics,
          strengthAreas: [],
          improvementAreas: [],
          learningMetrics: {
            totalLessonsCompleted: 0,
            totalExercisesCompleted: 0,
            averageScore: 0,
            totalTimeSpentMinutes: 0,
            longestStreak: 0,
            currentStreak: 0,
            lastActivityDate: now,
            totalMasteryScore: 0,
          },
          weeklyProgress: [],
          monthlyProgress: [],
          periodicProgress: [],
          achievementStats: {
            totalAchievements: 0,
            achievementsByCategory: {},
            lastAchievementDate: null,
            specialAchievements: [],
          },
          badgeStats: {
            totalBadges: 0,
            badgesByTier: {},
            lastBadgeDate: null,
            activeBadges: [],
          },
          learningPath: {
            currentLevel: 1,
            recommendedCategories: [],
            nextMilestones: [],
            customGoals: [],
          },
          createdAt: now,
          updatedAt: now,
        });

        await statisticsRepository.save(newStatistics); // Insertar individualmente

      } else {
        console.log(`Statistics record already exists for user "${user.email}". Skipping.`);
      }
    }

    console.log('Statistics seeder finished.'); // Ajustar mensaje final
  }
}
