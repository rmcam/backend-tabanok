import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { UserAchievement, AchievementStatus } from '../../features/gamification/entities/user-achievement.entity';
import { User } from '../../auth/entities/user.entity';
import { UserRole } from '../../auth/enums/auth.enum'; // Importar UserRole
import { Achievement } from '../../features/gamification/entities/achievement.entity';

export class UserAchievementSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const userAchievementRepository = this.dataSource.getRepository(UserAchievement);
    const userRepository = this.dataSource.getRepository(User);
    const achievementRepository = this.dataSource.getRepository(Achievement);

    const users = await userRepository.find();
    const achievements = await achievementRepository.find();

    if (users.length === 0 || achievements.length === 0) {
      console.log('Skipping UserAchievementSeeder: No users or achievements found.');
      return;
    }

    // Solo sembrar datos de prueba en entornos que no sean producción
    if (process.env.NODE_ENV !== 'production') {
      const now = new Date();
      const userAchievementsToSeed: Partial<UserAchievement>[] = [];

      // Create user achievements by iterating through users and assigning a subset of achievements
      for (const user of users) {
          // Select a random subset of achievements for each user
          const shuffledAchievements = achievements.sort(() => 0.5 - Math.random());
          const numberOfAchievementsToAssign = Math.floor(Math.random() * Math.min(shuffledAchievements.length, user.roles.includes(UserRole.ADMIN) ? 20 : user.roles.includes(UserRole.TEACHER) ? 15 : 10)) + 1; // Assign more achievements to active roles

          for (let i = 0; i < numberOfAchievementsToAssign; i++) {
              const achievement = shuffledAchievements[i];

              // Verificar si ya existe este logro de usuario antes de crearlo
              const existingUserAchievement = await userAchievementRepository.findOne({
                  where: { userId: user.id, achievementId: achievement.id }
              });

              if (!existingUserAchievement) {
                  // Simulate status and progress based on randomness and achievement requirement
                  const isCompleted = Math.random() > (user.roles.includes(UserRole.ADMIN) ? 0.1 : user.roles.includes(UserRole.TEACHER) ? 0.3 : 0.6); // Higher completion chance for active roles
                  const status = isCompleted ? AchievementStatus.COMPLETED : AchievementStatus.IN_PROGRESS;
                  const totalRequirement = typeof achievement.requirement === 'number' ? achievement.requirement : 1; // Use 1 if requirement is not a number

                  let currentProgress = 0;
                  let completedAt = null;
                  let dateAwarded = new Date(now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000); // Awarded in last 180 days

                  if (status === AchievementStatus.COMPLETED) {
                      currentProgress = totalRequirement;
                      completedAt = new Date(dateAwarded.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000); // Completed after awarded
                  } else {
                      currentProgress = Math.floor(Math.random() * totalRequirement);
                      completedAt = null;
                  }

                  userAchievementsToSeed.push({
                      userId: user.id,
                      achievementId: achievement.id,
                      achievementType: achievement.criteria === 'cultural_engagement' ? 'CULTURAL' : 'GENERAL', // Use cultural_engagement for cultural type
                      status: status,
                      progress: { current: currentProgress, total: totalRequirement },
                      completedAt: completedAt,
                      dateAwarded: dateAwarded,
                      createdAt: dateAwarded, // Use dateAwarded as creation date
                      // removed updatedAt: completedAt || dateAwarded, // Let TypeORM manage updatedAt
                  });
              } else {
                  console.log(`User Achievement for user "${user.email}" and achievement "${achievement.name}" already exists. Skipping.`);
              }
          }
      }

      // Use a single save call for efficiency
      await userAchievementRepository.save(userAchievementsToSeed);
      console.log(`Seeded ${userAchievementsToSeed.length} user achievement records (development environment).`);
    } else {
      console.log('Skipping UserAchievementSeeder in production environment.');
    }

    console.log('UserAchievement seeder finished.');
  }
}
