import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { UserLevel } from '../../features/gamification/entities/user-level.entity';
import { User } from '../../auth/entities/user.entity';
import { UserRole } from '../../auth/enums/auth.enum'; // Import UserRole

export class UserLevelSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const userLevelRepository = this.dataSource.getRepository(UserLevel);
    const userRepository = this.dataSource.getRepository(User);

    // Obtener todos los usuarios existentes para asociar niveles de usuario
    const users = await userRepository.find();

    const userLevelsToSeed = users.map(user => {
      const now = new Date();

      // Generate level and experience based on user role for some variation
      let baseLevel = user.role === UserRole.ADMIN ? 30 : user.role === UserRole.TEACHER ? 20 : 1;
      let levelRange = user.role === UserRole.ADMIN ? 10 : user.role === UserRole.TEACHER ? 15 : 25;
      const currentLevel = baseLevel + Math.floor(Math.random() * levelRange);
      const experiencePoints = currentLevel * 500 + Math.floor(Math.random() * 500); // Experience scales with level
      const experienceToNextLevel = (currentLevel + 1) * 500; // Consistent progression

      const longestStreak = Math.floor(Math.random() * (user.role === UserRole.ADMIN ? 100 : user.role === UserRole.TEACHER ? 70 : 40)); // Longer streaks for more active roles
      const currentStreak = Math.floor(Math.random() * longestStreak); // Current streak is less than or equal to longest
      const lastActivityDate = new Date(now.getTime() - Math.random() * (user.role === UserRole.ADMIN ? 3 : user.role === UserRole.TEACHER ? 5 : 10) * 24 * 60 * 60 * 1000); // More recent activity for active roles


      const consistencyStreak = {
        current: currentStreak,
        longest: longestStreak,
        lastActivityDate: lastActivityDate,
      };

      const streakHistory = Array.from({ length: Math.floor(Math.random() * 8) }).map(() => { // More streak history
        const duration = Math.floor(Math.random() * 15) + 1;
        const endDate = new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000); // Streaks ended in last 60 days
        const startDate = new Date(endDate.getTime() - duration * 24 * 60 * 60 * 1000);
        return { startDate, endDate, duration };
      });

      // Simulate achievements based on level and role
      const totalAchievements = Math.floor(currentLevel / 5 + Math.random() * 3);
      const achievements = Array.from({ length: totalAchievements }).map((_, index) => ({
        achievementId: `achievement-uuid-${Math.floor(Math.random() * 20) + 1}`, // More achievement IDs
        unlockedAt: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Unlocked in last 90 days
      }));

      const milestones = [
        { level: 5, reward: 'Insignia Bronce', isAchieved: currentLevel >= 5 },
        { level: 10, reward: 'Título Novato', isAchieved: currentLevel >= 10 },
        { level: 15, reward: 'Insignia Plata', isAchieved: currentLevel >= 15 },
        { level: 20, reward: 'Título Intermedio', isAchieved: currentLevel >= 20 },
        { level: 25, reward: 'Insignia Oro', isAchieved: currentLevel >= 25 },
        { level: 30, reward: 'Título Avanzado', isAchieved: currentLevel >= 30 },
      ];

      const levelHistory = Array.from({ length: currentLevel }).map((_, index) => {
        const level = index + 1;
        const achievedAt = new Date(now.getTime() - Math.random() * (currentLevel - level + 1) * 45 * 24 * 60 * 60 * 1000); // Achieved over a longer period
        const bonusesReceived = level % 5 === 0 ? [{ type: 'points', value: level * 20 }] : []; // More points for milestones
        return { level, achievedAt, bonusesReceived };
      });

      const activityLog = Array.from({ length: Math.floor(Math.random() * 20) }).map(() => { // More activity log entries
        const date = new Date(now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000); // Activity in last 14 days
        const activityTypes = ['exercise_completed', 'lesson_completed', 'cultural_contribution', 'community_post', 'quiz_completed', 'challenge_completed']; // More activity types
        const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
        const experienceGained = Math.floor(Math.random() * 80) + 20; // More experience gained
        const metadata = { activityDetails: 'Some details about the activity' }; // More realistic metadata
        return { date, activityType, experienceGained, metadata };
      });

      const bonuses = Array.from({ length: Math.floor(Math.random() * 3) }).map(() => ({ // More bonuses
        type: Math.random() > 0.5 ? 'experience_multiplier' : 'points_boost', // Different bonus types
        multiplier: Math.random() > 0.5 ? parseFloat((1.2 + Math.random() * 0.8).toFixed(1)) : undefined, // Higher multipliers
        value: Math.random() <= 0.5 ? Math.floor(Math.random() * 200) + 50 : undefined, // Points boost value
        expiresAt: new Date(now.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000), // Bonuses expire in next 14 days
      }));


      return userLevelRepository.create({
        userId: user.id,
        user: user, // Asociar la entidad User
        points: Math.floor(currentLevel * 100 + Math.random() * 1000), // Points scale with level
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
