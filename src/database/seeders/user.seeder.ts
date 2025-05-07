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

    const nombres = ['Antonio', 'María', 'José', 'Carmen', 'Juan', 'Ana', 'Luis', 'Isabel', 'Pedro', 'Sofía', 'Carlos', 'Laura', 'Miguel', 'Elena', 'Pablo', 'Andrea', 'Javier', 'Sara', 'Diego', 'Paula'];
    const apellidos = ['García', 'Rodríguez', 'López', 'Martínez', 'Pérez', 'González', 'Sánchez', 'Fernández', 'Romero', 'Torres', 'Díaz', 'Vázquez', 'Castro', 'Ruiz', 'Alvarez', 'Moreno', 'Jiménez', 'Ortiz', 'Serrano', 'Molina'];

    const usersToSeed = [];

    // Generate 50 random users
    for (let i = 0; i < 50; i++) {
      const nombre = nombres[Math.floor(Math.random() * nombres.length)];
      const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
      const email = `${nombre.toLowerCase()}.${apellido.toLowerCase()}${i}@example.com`;
      const role = i < 5 ? UserRole.ADMIN : i < 15 ? UserRole.TEACHER : UserRole.USER; // More varied role distribution
      const status = i % 3 === 0 ? UserStatus.ACTIVE : i % 3 === 1 ? UserStatus.INACTIVE : UserStatus.PENDING; // Add PENDING status
      const languages = i % 4 === 0 ? ['es', 'en', 'fr'] : i % 4 === 1 ? ['es', 'en'] : ['es']; // More language variety
      const theme = i % 2 === 0 ? 'light' : 'dark';

      usersToSeed.push({
        username: `${nombre.toLowerCase()}_${apellido.toLowerCase()}${i}`,
        email: email,
        password: 'password123', // Consider hashing this here or in the entity
        firstName: nombre,
        lastName: apellido,
        role: role,
        status: status,
        languages: languages,
        preferences: { notifications: Math.random() > 0.5, language: languages[0], theme: theme }, // Randomize notifications
      });
    }

    // Add specific users for known roles/testing
    usersToSeed.push({
        username: 'admin_user',
        email: 'admin@example.com',
        password: 'adminpassword',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        languages: ['es', 'en'],
        preferences: { notifications: true, language: 'es', theme: 'light' },
    });

     usersToSeed.push({
        username: 'teacher_user',
        email: 'teacher@example.com',
        password: 'teacherpassword',
        firstName: 'Teacher',
        lastName: 'User',
        role: UserRole.TEACHER,
        status: UserStatus.ACTIVE,
        languages: ['es'],
        preferences: { notifications: true, language: 'es', theme: 'dark' },
    });

    usersToSeed.push({
        username: 'regular_user',
        email: 'user@example.com',
        password: 'userpassword',
        firstName: 'Regular',
        lastName: 'User',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        languages: ['es'],
        preferences: { notifications: false, language: 'es', theme: 'light' },
    });


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
