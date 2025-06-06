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

    const gamificationData: Partial<Gamification>[] = [];

    for (const user of users) {
      // Verificar si ya existe un registro de gamificación para este usuario
      const existingGamification = await gamificationRepository.findOne({ where: { userId: user.id } });

      if (!existingGamification) {
        gamificationData.push({
          userId: user.id,
          points: 0, // Puntos iniciales
          stats: {
            lessonsCompleted: 0,
            exercisesCompleted: 0,
            perfectScores: 0,
            culturalContributions: 0,
          },
          recentActivities: [], // Actividades recientes vacías
          level: 1, // Nivel inicial
          experience: 0, // Experiencia inicial
          nextLevelExperience: 100, // Experiencia necesaria para el siguiente nivel (ej. Nivel 2)
          culturalAchievements: [],
        });
      } else {
        console.log(`Gamification record already exists for user "${user.email}". Skipping.`);
      }
    }

    // Implementar upsert manualmente
    console.log(`[GamificationSeeder] Seeding ${gamificationData.length} gamification records...`);
    for (const data of gamificationData) {
      try {
        // Intentar insertar un nuevo registro
        await gamificationRepository.insert({ ...data });
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
