import { DataSource, DeepPartial } from 'typeorm'; // Importar DeepPartial
import { DataSourceAwareSeed } from './data-source-aware-seed'; // Importar desde el nuevo archivo

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

    // Eliminar niveles de usuario existentes para evitar duplicados
    await userLevelRepository.clear();

    const userLevelsToSeed: UserLevel[] = []; // Array para almacenar los niveles de usuario creados

    for (const user of users) {
      const now = new Date();

      // Generate level and experience based on user role for some variation
      let baseLevel = user.role === UserRole.ADMIN ? 30 : user.role === UserRole.TEACHER ? 20 : 1;
      let levelRange = user.role === UserRole.ADMIN ? 10 : user.role === UserRole.TEACHER ? 15 : 25;
      const level = baseLevel + Math.floor(Math.random() * levelRange); // Usar 'level' en lugar de 'currentLevel'
      const experience = level * 500 + Math.floor(Math.random() * 500); // Usar 'experience' en lugar de 'experiencePoints'
      const experienceToNextLevel = (level + 1) * 500; // Consistent progression

      const longestStreak = Math.floor(Math.random() * (user.role === UserRole.ADMIN ? 100 : user.role === UserRole.TEACHER ? 70 : 40)); // Longer streaks for more active roles
      const currentStreak = Math.floor(Math.random() * longestStreak); // Current streak is less than or equal to longest
      const lastActivityDate = new Date(now.getTime() - Math.random() * (user.role === UserRole.ADMIN ? 3 : user.role === UserRole.TEACHER ? 5 : 10) * 24 * 60 * 60 * 1000); // More recent activity for active roles


      const consistencyStreak = {
        current: currentStreak,
        longest: longestStreak,
        lastActivityDate: lastActivityDate,
      };

      const streakHistory = Array.from({ length: Math.floor(Math.random() * 8) }).map(() => { // More streak history
        const length = Math.floor(Math.random() * 15) + 1; // Usar 'length' en lugar de 'duration'
        const date = new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000); // Usar 'date' en lugar de 'endDate'
        // Eliminar startDate, no está en la entidad
        return { date, length }; // Ajustar estructura para coincidir con la entidad
      });

      // Eliminar generación de achievements y milestones, no están en la entidad UserLevel

      const levelHistory = Array.from({ length: level }).map((_, index) => { // Usar 'level'
        const levelEntry = index + 1; // Usar 'levelEntry' para evitar conflicto con la variable 'level' principal
        const date = new Date(now.getTime() - Math.random() * (level - levelEntry + 1) * 45 * 24 * 60 * 60 * 1000); // Usar 'date' en lugar de 'achievedAt'
        // Eliminar bonusesReceived, no está en la entidad
        return { level: levelEntry, date }; // Ajustar estructura para coincidir con la entidad
      });

      const activityLog = Array.from({ length: Math.floor(Math.random() * 20) }).map(() => { // More activity log entries
        const timestamp = new Date(now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000); // Usar 'timestamp' en lugar de 'date'
        const activityTypes = ['exercise_completed', 'lesson_completed', 'cultural_contribution', 'community_post', 'quiz_completed', 'challenge_completed']; // More activity types
        const type = activityTypes[Math.floor(Math.random() * activityTypes.length)]; // Usar 'type' en lugar de 'activityType'
        const experienceGained = Math.floor(Math.random() * 80) + 20; // Mantener experienceGained si es relevante para details
        const details = { experienceGained: experienceGained, activityDetails: 'Some details about the activity' }; // Usar 'details' en lugar de 'metadata', ajustar estructura si es necesario
        return { type, timestamp, details }; // Ajustar estructura para coincidir con la entidad
      });

      const bonuses = Array.from({ length: Math.floor(Math.random() * 3) }).map(() => ({ // More bonuses
        type: Math.random() > 0.5 ? 'experience_multiplier' : 'points_boost', // Mantener type
        amount: Math.random() > 0.5 ? parseFloat((1.2 + Math.random() * 0.8).toFixed(1)) : Math.floor(Math.random() * 200) + 50, // Usar 'amount', combinar multiplier y value
        timestamp: new Date(now.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000), // Usar 'timestamp' en lugar de 'expiresAt'
      }));


      const userLevel = userLevelRepository.create({
        user: user, // Asociar la entidad User
        points: Math.floor(level * 100 + Math.random() * 1000), // Points scale with level
        level, // Usar 'level'
        experience, // Usar 'experience'
        experienceToNextLevel,
        consistencyStreak,
        streakHistory,
        // Eliminar achievements y milestones
        levelHistory,
        activityLog,
        bonuses,
        // Añadir lessonsCompleted, exercisesCompleted, perfectScores con valores por defecto o generados si es posible
        lessonsCompleted: Math.floor(Math.random() * (level * 2)),
        exercisesCompleted: Math.floor(Math.random() * (level * 3)),
        perfectScores: Math.floor(Math.random() * (level)),
        createdAt: now,
        updatedAt: now,
      } as DeepPartial<UserLevel>); // Conversión explícita aplicada al objeto completo

      userLevelsToSeed.push(userLevel); // Añadir el nivel de usuario creado al array
    }

    await userLevelRepository.save(userLevelsToSeed); // Guardar todos los niveles de usuario en una sola llamada

    console.log('UserLevel seeder finished.');
  }
}
