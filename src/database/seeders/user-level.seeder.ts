import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { UserLevel } from '../../features/gamification/entities/user-level.entity';
import { User } from '../../auth/entities/user.entity';

export class UserLevelSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const userLevelRepository = this.dataSource.getRepository(UserLevel);
    const userRepository = this.dataSource.getRepository(User);

    // Obtener algunos usuarios existentes para asociar niveles de usuario
    const users = await userRepository.find({ take: 5 }); // Obtener los primeros 5 usuarios

    const userLevelsToSeed = users.map(user => {
      const now = new Date();
      return userLevelRepository.create({
        userId: user.id,
        user: user, // Asociar la entidad User
        points: Math.floor(Math.random() * 1000), // Puntos aleatorios de ejemplo
        currentLevel: Math.floor(Math.random() * 10) + 1, // Nivel aleatorio de ejemplo (1-10)
        experiencePoints: Math.floor(Math.random() * 500), // Puntos de experiencia aleatorios
        experienceToNextLevel: 1000, // Ejemplo de experiencia para el siguiente nivel
        consistencyStreak: {
          current: Math.floor(Math.random() * 10), // Racha actual aleatoria
          longest: Math.floor(Math.random() * 15), // Racha más larga aleatoria
          lastActivityDate: new Date(now.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000), // Fecha de última actividad reciente
        },
        streakHistory: [
          { startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), endDate: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000), duration: 5 },
          { startDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), endDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), duration: 6 },
        ],
        achievements: [
          { achievementId: 'achievement-uuid-1', unlockedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) },
          { achievementId: 'achievement-uuid-2', unlockedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
        ],
        milestones: [
          { level: 5, reward: 'Insignia Bronce', isAchieved: true },
          { level: 10, reward: 'Título Novato', isAchieved: false },
        ],
        levelHistory: [
          { level: 1, achievedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), bonusesReceived: [] },
          { level: 2, achievedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), bonusesReceived: [{ type: 'points', value: 50 }] },
        ],
        activityLog: [
          { date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), activityType: 'exercise_completed', experienceGained: 10, metadata: { exerciseId: 'ex-uuid-1' } },
          { date: new Date(now.getTime() - 0.5 * 24 * 60 * 60 * 1000), activityType: 'lesson_completed', experienceGained: 20, metadata: { lessonId: 'lesson-uuid-1' } },
        ],
        bonuses: [
          { type: 'experience_multiplier', multiplier: 1.5, expiresAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) },
        ],
        createdAt: now,
        updatedAt: now,
      });
    });

    // Eliminar niveles de usuario existentes para evitar duplicados
    await userLevelRepository.clear();

    await userLevelRepository.save(userLevelsToSeed);

    console.log('UserLevel seeder finished.');
  }
}
