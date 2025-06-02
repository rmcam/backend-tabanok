import { v4 as uuidv4 } from 'uuid';
import { DataSource } from 'typeorm';

import { Gamification } from '../../features/gamification/entities/gamification.entity';
import { User } from '../../auth/entities/user.entity'; // Importar la entidad User
import { DataSourceAwareSeed } from './data-source-aware-seed';

export class GamificationSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const gamificationRepository = this.dataSource.getRepository(Gamification);
    const userRepository = this.dataSource.getRepository(User); // Obtener el repositorio de User

    // Obtener usuarios existentes (asumiendo que UserSeeder ya se ejecutó)
    const users = await userRepository.find();

    // Generar datos de gamificación para más usuarios
    const numUsers = users.length;
    const gamificationData = [];

    for (let i = 0; i < numUsers; i++) {
      const userId = users[i].id;
      const points = Math.floor(Math.random() * 500); // Puntos aleatorios
      const lessonsCompleted = Math.floor(Math.random() * 20); // Lecciones completadas aleatorias
      const exercisesCompleted = Math.floor(Math.random() * 40); // Ejercicios completados aleatorios
      const perfectScores = Math.floor(Math.random() * 10); // Calificaciones perfectas aleatorias
      const learningStreak = Math.floor(Math.random() * 15); // Racha de aprendizaje aleatoria
      const culturalContributions = Math.floor(Math.random() * 5); // Contribuciones culturales aleatorias
      const level = Math.floor(points / 100) + 1; // Nivel basado en puntos
      const experience = points * 1.5; // Experiencia basada en puntos
      const nextLevelExperience = (level * 100) * 1.5; // Experiencia necesaria para el siguiente nivel

      const recentActivities = [];
      for (let j = 0; j < Math.floor(Math.random() * 5); j++) {
        const activityType = j % 2 === 0 ? 'lesson_completed' : 'exercise_completed';
        const description = `Completó ${activityType === 'lesson_completed' ? 'Lección' : 'Ejercicio'} ${Math.floor(Math.random() * 20) + 1}`;
        const pointsEarned = Math.floor(Math.random() * 30) + 10;
        recentActivities.push({ type: activityType, description: description, pointsEarned: pointsEarned, timestamp: new Date() });
      }

      gamificationData.push({
        userId: userId,
        points: points,
        stats: {
          lessonsCompleted: lessonsCompleted,
          exercisesCompleted: exercisesCompleted,
          perfectScores: perfectScores,
          learningStreak: learningStreak,
          culturalContributions: culturalContributions,
        },
        recentActivities: recentActivities,
        level: level,
        experience: experience,
        nextLevelExperience: nextLevelExperience,
        culturalAchievements: [],
      });
    }

    // Implementar upsert manualmente
    console.log(`[GamificationSeeder] Seeding ${gamificationData.length} gamification records...`);
    for (const data of gamificationData) {
      try {
        // Intentar insertar un nuevo registro
        await gamificationRepository.insert({ ...data, id: uuidv4() });
      } catch (error) {
        // Si falla debido a una violación de la restricción única, actualizar el registro existente
        if (error.code === '23505') { // Código de error para unique_violation
          await gamificationRepository.update({ userId: data.userId }, data);
        } else {
          // Si es un error diferente, relanzarlo
          throw error;
        }
      }
    }
    console.log("[GamificationSeeder] Gamification records seeded successfully.");
  }
}
