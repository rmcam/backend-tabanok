import { DataSource } from 'typeorm';
import { BaseAchievement } from '../../features/gamification/entities/base-achievement.entity';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class BaseAchievementSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const repository = this.dataSource.getRepository(BaseAchievement);
    const baseAchievementsJsonPath = path.resolve(__dirname, '../files/json/base_achievements.json');

    try {
      const baseAchievementsJsonContent = JSON.parse(fs.readFileSync(baseAchievementsJsonPath, 'utf-8'));

      for (const achievementData of baseAchievementsJsonContent) {
        const existingAchievement = await repository.findOne({ where: { name: achievementData.name } });

        if (!existingAchievement) {
          const newAchievement = repository.create({
            ...achievementData,
            id: uuidv4(),
          });
          await repository.save(newAchievement);
          console.log(`Base Achievement "${achievementData.name}" seeded.`);
        } else {
          console.log(`Base Achievement "${existingAchievement.name}" already exists. Skipping.`);
        }
      }
      console.log('BaseAchievement seeder finished.');
    } catch (error) {
      console.error('Error seeding base achievements:', error);
    }
  }
}
