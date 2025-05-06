import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { Gamification } from '../../features/gamification/entities/gamification.entity';

export default class GamificationSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(Gamification);

    // Datos de ejemplo para Gamification (asociados a IDs de usuario ficticios por ahora)
    const gamificationData = [
      {
        userId: 'fictional-user-id-1',
        points: 100,
        stats: {
          lessonsCompleted: 5,
          exercisesCompleted: 10,
          perfectScores: 3,
          learningStreak: 7,
          culturalContributions: 2,
        },
        recentActivities: [
          { type: 'lesson_completed', description: 'Completó Lección 1', pointsEarned: 20, timestamp: new Date() },
          { type: 'exercise_completed', description: 'Completó Ejercicio 5', pointsEarned: 10, timestamp: new Date() },
        ],
        level: 2,
        experience: 150,
        nextLevelExperience: 300,
        culturalAchievements: [],
      },
      {
        userId: 'fictional-user-id-2',
        points: 50,
        stats: {
          lessonsCompleted: 2,
          exercisesCompleted: 5,
          perfectScores: 1,
          learningStreak: 3,
          culturalContributions: 0,
        },
        recentActivities: [
          { type: 'lesson_completed', description: 'Completó Lección 2', pointsEarned: 20, timestamp: new Date() },
        ],
        level: 1,
        experience: 50,
        nextLevelExperience: 100,
        culturalAchievements: [],
      },
    ];

    const moreGamificationData = [
      {
        userId: 'fictional-user-id-3',
        points: 300,
        stats: {
          lessonsCompleted: 15,
          exercisesCompleted: 30,
          perfectScores: 10,
          learningStreak: 15,
          culturalContributions: 5,
        },
        recentActivities: [
          { type: 'exercise_completed', description: 'Completó Ejercicio 15', pointsEarned: 10, timestamp: new Date() },
          { type: 'cultural_contribution', description: 'Contribución al diccionario', pointsEarned: 50, timestamp: new Date() },
        ],
        level: 5,
        experience: 700,
        nextLevelExperience: 1000,
        culturalAchievements: [],
      },
      {
        userId: 'fictional-user-id-4',
        points: 75,
        stats: {
          lessonsCompleted: 3,
          exercisesCompleted: 8,
          perfectScores: 2,
          learningStreak: 5,
          culturalContributions: 1,
        },
        recentActivities: [
          { type: 'lesson_completed', description: 'Completó Lección 3', pointsEarned: 20, timestamp: new Date() },
        ],
        level: 2,
        experience: 200,
        nextLevelExperience: 300,
        culturalAchievements: [],
      },
    ];

    gamificationData.push(...moreGamificationData);

    for (const data of gamificationData) {
      const gamification = repository.create(data);
      await repository.save(gamification);
    }
  }
}
