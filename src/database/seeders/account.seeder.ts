import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { Account } from '../../features/account/entities/account.entity';
import { User } from '../../auth/entities/user.entity';

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
          // Los campos points, level, streak, lastActivity, settings, preferences, isActive
          // tienen valores por defecto o son opcionales. No es necesario incluirlos aquí
          // a menos que se quieran valores iniciales específicos.
        });
        await accountRepository.save(newAccount);
        console.log(`Account created for user "${user.email}".`);
      } else {
        console.log(`Account already exists for user "${user.email}". Skipping.`);
      }
    }
  }
}
