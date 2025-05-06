import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { UserRole, UserStatus } from '../../auth/enums/auth.enum'; // Importar UserRole y UserStatus del enum correcto
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
        role: UserRole.ADMIN, // Usar enum UserRole
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
        role: UserRole.USER, // Usar enum UserRole
        status: UserStatus.ACTIVE, // Agregar status
        languages: ['es'], // Agregar languages
        preferences: { notifications: true, language: 'es', theme: 'light' }, // Agregar preferences
      },
      {
        username: 'mentor_user',
        email: 'mentor@example.com',
        password: 'password123',
        firstName: 'Mentor',
        lastName: 'User',
        role: UserRole.TEACHER, // Cambiado de MENTOR a TEACHER para coincidir con el enum actualizado
        status: UserStatus.ACTIVE,
        languages: ['es', 'en'],
        preferences: { notifications: true, language: 'es', theme: 'dark' },
      },
      {
        username: 'inactive_user',
        email: 'inactive@example.com',
        password: 'password123',
        firstName: 'Inactive',
        lastName: 'User',
        role: UserRole.USER, // Usar enum UserRole
        status: UserStatus.INACTIVE,
        languages: ['es'],
        preferences: { notifications: false, language: 'es', theme: 'light' },
      },
      {
        username: 'another_user',
        email: 'another@example.com',
        password: 'password123',
        firstName: 'Another',
        lastName: 'User',
        role: UserRole.USER, // Usar enum UserRole
        status: UserStatus.ACTIVE,
        languages: ['en'],
        preferences: { notifications: true, language: 'en', theme: 'light' },
      },
    ];

    for (const userData of usersToSeed) {
      const existingUser = await userRepository.findOne({ where: { email: userData.email } });

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const newUser = userRepository.create({
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          status: userData.status,
          languages: userData.languages,
          preferences: userData.preferences,
          // Otros campos con valores por defecto o que no se siembran inicialmente
        });
        await userRepository.save(newUser);
        console.log(`User "${userData.email}" seeded.`);
      } else {
        console.log(`User "${userData.email}" already exists. Skipping.`);
      }
    }
  }
}
