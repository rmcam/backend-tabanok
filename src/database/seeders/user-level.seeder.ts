import { DataSource, DeepPartial } from 'typeorm'; // Importar DeepPartial
import { DataSourceAwareSeed } from './data-source-aware-seed'; // Importar desde el nuevo archivo

import { UserLevel } from '../../features/gamification/entities/user-level.entity';
import { User } from '../../auth/entities/user.entity';
import { UserRole } from '../../auth/enums/auth.enum'; // Import UserRole
// import { v4 as uuidv4 } from 'uuid'; // Eliminar importación de uuidv4

export class UserLevelSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const userLevelRepository = this.dataSource.getRepository(UserLevel);
    const userRepository = this.dataSource.getRepository(User);

    // Obtener todos los usuarios existentes para asociar niveles de usuario
    const users = await userRepository.find();

    if (users.length === 0) {
      console.log('No users found. Skipping UserLevelSeeder.');
      return;
    }

    for (const user of users) {
      // Verificar si ya existe un nivel de usuario para este usuario
      const existingUserLevel = await userLevelRepository.findOne({ where: { user: { id: user.id } } });

      if (!existingUserLevel) {
        const now = new Date();

        // En producción, crear un nivel de usuario base con valores por defecto
        if (process.env.NODE_ENV === 'production') {
          const userLevel = userLevelRepository.create({
            user: user,
            points: 0,
            level: 1,
            experience: 0,
            experienceToNextLevel: 100, // Valor inicial para el siguiente nivel
            consistencyStreak: { current: 0, longest: 0, lastActivityDate: now },
            streakHistory: [],
            levelHistory: [{ level: 1, date: now }],
            activityLog: [],
            bonuses: [],
            lessonsCompleted: 0,
            exercisesCompleted: 0,
            perfectScores: 0,
            createdAt: now,
            updatedAt: now,
          } as DeepPartial<UserLevel>);
          await userLevelRepository.save(userLevel);
          console.log(`User Level created for user "${user.email}" (production environment).`);
        } else {
          // En desarrollo, generar datos de prueba aleatorios
          let baseLevel = user.roles[0] === UserRole.ADMIN ? 30 : user.roles[0] === UserRole.TEACHER ? 20 : 1;
          let levelRange = user.roles[0] === UserRole.ADMIN ? 10 : user.roles[0] === UserRole.TEACHER ? 15 : 25;
          const level = baseLevel + Math.floor(Math.random() * levelRange);
          const experience = level * 500 + Math.floor(Math.random() * 500);
          const experienceToNextLevel = (level + 1) * 500;

          const longestStreak = Math.floor(Math.random() * (user.roles[0] === UserRole.ADMIN ? 100 : user.roles[0] === UserRole.TEACHER ? 70 : 40));
          const currentStreak = Math.random() > 0.2 ? Math.floor(Math.random() * (longestStreak + 1)) : 0;
          const lastActivityDate = new Date(now.getTime() - Math.random() * (user.roles[0] === UserRole.ADMIN ? 3 : user.roles[0] === UserRole.TEACHER ? 5 : 10) * 24 * 60 * 60 * 1000);

          const consistencyStreak = {
            current: currentStreak,
            longest: longestStreak,
            lastActivityDate: lastActivityDate,
          };

          const streakHistory = Array.from({ length: Math.floor(Math.random() * 8) }).map(() => {
            const length = Math.floor(Math.random() * 15) + 1;
            const date = new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000);
            return { date, length };
          });

          const levelHistory = Array.from({ length: level }).map((_, index) => {
            const levelEntry = index + 1;
            const date = new Date(now.getTime() - Math.random() * (level - levelEntry + 1) * 45 * 24 * 60 * 60 * 1000);
            return { level: levelEntry, date };
          });

          const activityLog = Array.from({ length: Math.floor(Math.random() * 20) }).map(() => {
            const timestamp = new Date(now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000);
            const activityTypes = ['exercise_completed', 'lesson_completed', 'cultural_contribution', 'community_post', 'quiz_completed', 'challenge_completed'];
            const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
            const experienceGained = Math.floor(Math.random() * 80) + 20;
            const details = { experienceGained: experienceGained, activityDetails: 'Some details about the activity' };
            return { type, timestamp, details };
          });

          const bonuses = Array.from({ length: Math.floor(Math.random() * 3) }).map(() => ({
            type: Math.random() > 0.5 ? 'experience_multiplier' : 'points_boost',
            amount: Math.random() > 0.5 ? parseFloat((1.2 + Math.random() * 0.8).toFixed(1)) : Math.floor(Math.random() * 200) + 50,
            timestamp: new Date(now.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000),
          }));

          const userLevel = userLevelRepository.create({
            user: user,
            points: Math.floor(level * 100 + Math.random() * 1000),
            level,
            experience,
            experienceToNextLevel,
            consistencyStreak,
            streakHistory,
            levelHistory,
            activityLog,
            bonuses,
            lessonsCompleted: Math.floor(Math.random() * (level * 2)),
            exercisesCompleted: Math.floor(Math.random() * (level * 3)),
            perfectScores: Math.floor(Math.random() * (level)),
            createdAt: now,
            updatedAt: now,
          } as DeepPartial<UserLevel>);
          await userLevelRepository.save(userLevel);
          console.log(`User Level created for user "${user.email}" (development environment).`);
        }
      } else {
        console.log(`User Level already exists for user "${user.email}". Skipping.`);
      }
    }

    console.log('UserLevel seeder finished.');
  }
}
