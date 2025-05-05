import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { UserRole, UserStatus } from '../../auth/enums/auth.enum'; // Importar enums
import * as bcrypt from 'bcryptjs';

export class UserSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);

    const usersToSeed = [
      {
        username: 'admin_user', // Agregar username
        email: 'admin@example.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN, // Usar enum
        status: UserStatus.ACTIVE, // Agregar status
        languages: ['es'], // Agregar languages
        preferences: { notifications: true, language: 'es', theme: 'light' }, // Agregar preferences
      },
      {
        username: 'regular_user', // Agregar username
        email: 'user@example.com',
        password: 'password123',
        firstName: 'Regular',
        lastName: 'User',
        role: UserRole.USER, // Usar enum
        status: UserStatus.ACTIVE, // Agregar status
        languages: ['es'], // Agregar languages
        preferences: { notifications: true, language: 'es', theme: 'light' }, // Agregar preferences
      },
    ];

    for (const userData of usersToSeed) {
      const existingUser = await userRepository.findOne({ where: { email: userData.email } });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const newUser = userRepository.create({
          ...userData,
          password: hashedPassword,
        });
        await userRepository.save(newUser);
        console.log(`User "${userData.email}" seeded.`);
      } else {
        console.log(`User "${userData.email}" already exists. Skipping.`);
      }
    }
  }
}
