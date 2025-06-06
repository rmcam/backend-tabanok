
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
          points: 0, // Inicializar puntos a 0
          level: 1, // Inicializar nivel a 1
          streak: 0, // Inicializar racha a 0
          lastActivity: new Date(), // Fecha de actividad actual
          settings: { emailNotifications: true, pushNotifications: true }, // Configuración por defecto
          preferences: { language: user.languages[0] || 'es', theme: 'light' }, // Preferencias por defecto
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
