
import { DataSource } from 'typeorm';
import { Account } from '../../features/account/entities/account.entity';
import { User } from '../../auth/entities/user.entity';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import * as fs from 'fs';
import * as path from 'path';

export class AccountSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const accountRepository = this.dataSource.getRepository(Account);
    const userRepository = this.dataSource.getRepository(User);
    const accountsJsonPath = path.resolve(__dirname, '../files/json/accounts.json');

    try {
      const accountsJsonContent = JSON.parse(fs.readFileSync(accountsJsonPath, 'utf-8'));

      for (const accountData of accountsJsonContent) {
        const user = await userRepository.findOne({ where: { email: accountData.userId } });

        if (!user) {
          console.log(`User with email ${accountData.userId} not found. Skipping account creation.`);
          continue;
        }

        const existingAccount = await accountRepository.findOne({ where: { user: { id: user.id } } });

        if (!existingAccount) {
          const newAccount = accountRepository.create({
            user: user,
            points: accountData.points,
            level: accountData.level,
            streak: accountData.streak,
            lastActivity: new Date(accountData.lastActivity),
            settings: accountData.settings,
            preferences: accountData.preferences,
            isActive: accountData.isActive,
          });
          await accountRepository.save(newAccount);
          console.log(`Account created for user "${user.email}".`);
        } else {
          console.log(`Account already exists for user "${user.email}". Skipping.`);
        }
      }
    } catch (error) {
      console.error('Error seeding accounts:', error);
    }
  }
}
