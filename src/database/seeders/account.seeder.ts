
import { DataSource } from 'typeorm';
import { Account } from '../../features/account/entities/account.entity';
import { User } from '../../auth/entities/user.entity';
import { UserStatus } from '../../auth/enums/auth.enum';
import { DataSourceAwareSeed } from './data-source-aware-seed';

export class AccountSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const accountRepository = this.dataSource.getRepository(Account);
    const userRepository = this.dataSource.getRepository(User);

    const users = await userRepository.find();

    if (users.length === 0) {
      console.log('No users found. Skipping AccountSeeder.');
      return;
    }

    for (const user of users) {
      const existingAccount = await accountRepository.findOne({ where: { user: { id: user.id } } });

      if (!existingAccount) {
        const newAccount = accountRepository.create({
          user: user,
          points: Math.floor(Math.random() * 1000), // Puntos aleatorios entre 0 y 999
          level: Math.floor(Math.random() * 10) + 1, // Nivel aleatorio entre 1 y 10
          streak: Math.floor(Math.random() * 30), // Racha aleatoria entre 0 y 29
          lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Actividad reciente en los últimos 30 días
          settings: { emailNotifications: Math.random() > 0.5, pushNotifications: Math.random() > 0.5 }, // Configuración aleatoria
          preferences: { language: user.languages[0] || 'es', theme: Math.random() > 0.5 ? 'light' : 'dark' }, // Preferencias basadas en el usuario
          isActive: user.status === UserStatus.ACTIVE, // Activa si el usuario está activo
        });
        await accountRepository.save(newAccount);
        console.log(`Account created for user "${user.email}".`);
      } else {
        console.log(`Account already exists for user "${user.email}". Skipping.`);
      }
    }
  }
}
