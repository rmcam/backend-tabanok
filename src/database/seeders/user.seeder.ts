import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Account } from '../../features/account/entities/account.entity';
import { UserRole, UserStatus } from '../../auth/enums/auth.enum';

@Injectable()
export class UserSeeder {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async seed() {
    await this.seedUsersWithAccounts();
  }

  private async seedUsersWithAccounts() {
    const usersData = [
      {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password', // Considerar hashear en un entorno real
        firstName: 'Test',
        lastName: 'User',
        languages: ['es'],
        preferences: { notifications: true, language: 'es', theme: 'light' },
        role: UserRole.USER,
        dateOfBirth: new Date('2000-11-20'),
        country: 'Colombia',
        city: 'Cali',
        isEmailVerified: true,
        account: {
          streak: 5,
          points: 150,
          level: 2,
        },
      },
      {
        username: 'teacheruser',
        email: 'teacher@example.com',
        password: 'password', // Considerar hashear
        firstName: 'Teacher',
        lastName: 'User',
        languages: ['es', 'kamentsa'],
        preferences: { notifications: true, language: 'es', theme: 'light' },
        role: UserRole.TEACHER,
        dateOfBirth: new Date('1985-05-15'),
        country: 'Colombia',
        city: 'Medellin',
        isEmailVerified: true,
        account: {
          streak: 10,
          points: 500,
          level: 5,
        },
      },
      {
        username: 'adminuser',
        email: 'admin@example.com',
        password: 'password', // Considerar hashear
        firstName: 'Admin',
        lastName: 'User',
        languages: ['es'],
        preferences: { notifications: true, language: 'es', theme: 'dark' },
        role: UserRole.ADMIN,
        dateOfBirth: new Date('1990-01-01'),
        country: 'Colombia',
        city: 'Bogota',
        isEmailVerified: true,
        account: {
          streak: 0,
          points: 1000,
          level: 10,
        },
      },
      // Añadir más usuarios si es necesario
    ];

    for (const userData of usersData) {
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email },
      });

      if (!existingUser) {
        const user = this.userRepository.create({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          status: UserStatus.ACTIVE, // Asumir estado activo por defecto
          languages: userData.languages,
          preferences: userData.preferences,
          dateOfBirth: userData.dateOfBirth,
          country: userData.country,
          city: userData.city,
          isEmailVerified: userData.isEmailVerified,
          // Los campos level, points, culturalPoints, gameStats se manejan en la entidad Account o son calculados
        });
        await this.userRepository.save(user);

        const account = this.accountRepository.create({
          points: userData.account.points,
          level: userData.account.level,
          streak: userData.account.streak,
          isActive: true, // Asumir cuenta activa por defecto
          settings: {}, // Proporcionar objeto vacío si es necesario
          preferences: {}, // Proporcionar objeto vacío si es necesario
          user: user,
        });
        await this.accountRepository.save(account);
      }
    }
  }
}
