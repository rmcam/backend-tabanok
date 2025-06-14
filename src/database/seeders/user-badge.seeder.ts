import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed'; // Importar desde el nuevo archivo
import { UserBadge } from '../../features/gamification/entities/user-badge.entity';
import { User } from '../../auth/entities/user.entity'; // Importar la entidad User
import { Badge } from '../../features/gamification/entities/badge.entity'; // Importar la entidad Badge

export class UserBadgeSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const userBadgeRepository = this.dataSource.getRepository(UserBadge);
    const userRepository = this.dataSource.getRepository(User); // Obtener el repositorio de User
    const badgeRepository = this.dataSource.getRepository(Badge); // Obtener el repositorio de Badge

    // Obtener usuarios y badges existentes
    const users = await userRepository.find();
    const badges = await badgeRepository.find();

    if (users.length === 0 || badges.length === 0) {
        console.log('Skipping UserBadgeSeeder: No users or badges found.');
        return;
    }

    // Solo sembrar datos de prueba en entornos que no sean producción
    if (process.env.NODE_ENV !== 'production') {
      const userBadgesToSeed: Partial<UserBadge>[] = [];
      const now = new Date();

      // Create user badge records by iterating through users and assigning a subset of badges
      for (const user of users) {
          // Select a random subset of badges for each user
          const shuffledBadges = badges.sort(() => 0.5 - Math.random());
          const numberOfBadgesToAssign = Math.floor(Math.random() * Math.min(shuffledBadges.length, user.roles[0] === 'admin' ? 15 : user.roles[0] === 'teacher' ? 10 : 5)) + 1; // Assign more badges to active roles

          for (let i = 0; i < numberOfBadgesToAssign; i++) {
              const badge = shuffledBadges[i];

              // Verificar si ya existe esta insignia de usuario antes de crearla
              const existingUserBadge = await userBadgeRepository.findOne({
                  where: { userId: user.id, badgeId: badge.id }
              });

              if (!existingUserBadge) {
                  // Simulate creation date
                  const createdAt = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000); // Awarded in the last year

                  userBadgesToSeed.push({
                      userId: user.id,
                      badgeId: badge.id,
                      createdAt: createdAt,
                  });
              } else {
                  console.log(`User Badge for user "${user.email}" and badge "${badge.name}" already exists. Skipping.`);
              }
          }
      }

      // Use a single save call for efficiency
      await userBadgeRepository.save(userBadgesToSeed);
      console.log(`Seeded ${userBadgesToSeed.length} user badge records (development environment).`);
    } else {
      console.log('Skipping UserBadgeSeeder in production environment.');
    }

    console.log('UserBadge seeder finished.');
  }
}
