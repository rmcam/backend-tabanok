import { DataSource } from "typeorm";
import { User } from "../../auth/entities/user.entity";
import { DataSourceAwareSeed } from "./data-source-aware-seed";
import * as argon2 from "argon2";
import * as fs from 'fs';
import * as path from 'path';

export class UserSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);
    const usersJsonPath = path.resolve(__dirname, '../files/json/users.json');

    try {
      const usersJsonContent = JSON.parse(fs.readFileSync(usersJsonPath, 'utf-8'));
      const usersToCreate = [];

      for (const userData of usersJsonContent) {
        const existingUser = await userRepository.findOne({ where: { email: userData.email } });

        if (!existingUser) {
          const user = new User();
          user.email = userData.email;
          user.password = await argon2.hash(userData.password);
          user.firstName = userData.firstName;
          user.lastName = userData.lastName;
          user.username = userData.username;
          user.roles = userData.roles;
          user.languages = userData.languages || [];
          user.preferences = userData.preferences || {};
          usersToCreate.push(user);
        } else {
          console.log(`User with email ${userData.email} already exists. Skipping.`);
        }
      }

      if (usersToCreate.length > 0) {
        await userRepository.save(usersToCreate);
        console.log(`Seeded ${usersToCreate.length} users.`);
      } else {
        console.log('No new users to seed.');
      }

    } catch (error) {
      console.error('Error seeding users:', error);
    }
  }
}
