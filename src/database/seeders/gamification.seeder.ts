import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Gamification } from '../../features/gamification/entities/gamification.entity';
import { User } from '../../auth/entities/user.entity';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import * as fs from 'fs';
import * as path from 'path';

export class GamificationSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const gamificationRepository = this.dataSource.getRepository(Gamification);
    const userRepository = this.dataSource.getRepository(User);
    const gamificationJsonPath = path.resolve(__dirname, '../files/json/gamification.json');

    try {
      const gamificationJsonContent = JSON.parse(fs.readFileSync(gamificationJsonPath, 'utf-8'));

      for (const gamificationData of gamificationJsonContent) {
        const user = await userRepository.findOne({ where: { email: gamificationData.userEmail } });

        if (!user) {
          console.warn(`User with email "${gamificationData.userEmail}" not found. Skipping.`);
          continue;
        }

        const existingGamification = await gamificationRepository.findOne({ where: { userId: user.id } });

        if (!existingGamification) {
          const newGamification = gamificationRepository.create({
            userId: user.id,
            points: gamificationData.points,
            stats: gamificationData.stats,
            recentActivities: gamificationData.recentActivities,
            level: gamificationData.level,
            experience: gamificationData.experience,
            nextLevelExperience: gamificationData.nextLevelExperience,
            culturalAchievements: gamificationData.culturalAchievements,
          });
          await gamificationRepository.save(newGamification);
          console.log(`Gamification data for user "${user.email}" seeded.`);
        } else {
          console.log(`Gamification data for user "${user.email}" already exists. Skipping.`);
        }
      }
      console.log('Gamification seeder finished.');
    } catch (error) {
      console.error('Error seeding gamification data:', error);
    }
  }
}
