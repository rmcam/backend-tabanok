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

    // Obtener más usuarios existentes para asociar niveles de usuario
    const users = await userRepository.find({ take: 10 }); // Obtener los primeros 10 usuarios

    const userLevelsToSeed = users.map(user => {
      const now = new Date();
      const currentLevel = Math.floor(Math.random() * 20) + 1; // Nivel aleatorio de ejemplo (1-20)
      const experiencePoints = Math.floor(Math.random() * 1000); // Puntos de experiencia aleatorios
      const experienceToNextLevel = (currentLevel + 1) * 500; // Experiencia para el siguiente nivel basada en el nivel actual

      const consistencyStreak = {
        current: Math.floor(Math.random() * 30), // Racha actual aleatoria (0-30)
        longest: Math.floor(Math.random() * 60), // Racha más larga aleatoria (0-60)
        lastActivityDate: new Date(now.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000), // Fecha de última actividad reciente
      };

      const streakHistory = Array.from({ length: Math.floor(Math.random() * 5) }).map(() => {
        const duration = Math.floor(Math.random() * 10) + 1;
        const endDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        const startDate = new Date(endDate.getTime() - duration * 24 * 60 * 60 * 1000);
        return { startDate, endDate, duration };
      });

      const achievements = Array.from({ length: Math.floor(Math.random() * 5) }).map(() => ({
        achievementId: `achievement-uuid-${Math.floor(Math.random() * 10) + 1}`, // IDs de logro ficticios
        unlockedAt: new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000),
      }));

      const milestones = [
        { level: 5, reward: 'Insignia Bronce', isAchieved: currentLevel >= 5 },
        { level: 10, reward: 'Título Novato', isAchieved: currentLevel >= 10 },
        { level: 20, reward: 'Insignia Oro', isAchieved: currentLevel >= 20 },
      ];

      const levelHistory = Array.from({ length: currentLevel }).map((_, index) => {
        const level = index + 1;
        const achievedAt = new Date(now.getTime() - Math.random() * (currentLevel - level + 1) * 30 * 24 * 60 * 60 * 1000);
        const bonusesReceived = level % 5 === 0 ? [{ type: 'points', value: level * 10 }] : [];
        return { level, achievedAt, bonusesReceived };
      });

      const activityLog = Array.from({ length: Math.floor(Math.random() * 10) }).map(() => {
        const date = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        const activityTypes = ['exercise_completed', 'lesson_completed', 'cultural_contribution', 'community_post'];
        const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const experienceGained = Math.floor(Math.random() * 50) + 10;
        const metadata = {}; // Metadatos de ejemplo
        return { date, activityType, experienceGained, metadata };
      });

      const bonuses = Array.from({ length: Math.floor(Math.random() * 2) }).map(() => ({
        type: 'experience_multiplier',
        multiplier: parseFloat((1.1 + Math.random() * 0.5).toFixed(1)),
        expiresAt: new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
      }));


      return userLevelRepository.create({
        userId: user.id,
        user: user, // Asociar la entidad User
        points: Math.floor(Math.random() * 5000), // Puntos aleatorios de ejemplo (0-5000)
        currentLevel,
        experiencePoints,
        experienceToNextLevel,
        consistencyStreak,
        streakHistory,
        achievements,
        milestones,
        levelHistory,
        activityLog,
        bonuses,
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
