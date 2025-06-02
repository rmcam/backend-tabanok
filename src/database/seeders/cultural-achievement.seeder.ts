import { v4 as uuidv4 } from 'uuid';
import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { CulturalAchievement, AchievementCategory, AchievementType, AchievementTier } from '../../features/gamification/entities/cultural-achievement.entity';
import * as fs from 'fs';
import * as path from 'path';

export class CulturalAchievementSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const culturalAchievementRepository = this.dataSource.getRepository(CulturalAchievement);
    const culturalAchievementsJsonPath = path.resolve(__dirname, '../files/json/cultural_achievements.json');

    try {
      const culturalAchievementsJsonContent = JSON.parse(fs.readFileSync(culturalAchievementsJsonPath, 'utf-8'));

      for (const achievementData of culturalAchievementsJsonContent) {
        const existingAchievement = await culturalAchievementRepository.findOne({ where: { name: achievementData.name } });

        if (!existingAchievement) {
          const newAchievement = culturalAchievementRepository.create({
            id: uuidv4(),
            name: achievementData.name,
            description: achievementData.description,
            category: achievementData.category as AchievementCategory,
            type: achievementData.type as AchievementType,
            tier: achievementData.tier as AchievementTier,
            requirements: achievementData.requirements,
            pointsReward: achievementData.pointsReward,
            isActive: achievementData.isActive,
            isSecret: achievementData.isSecret,
          });
          await culturalAchievementRepository.save(newAchievement);
          console.log(`Cultural Achievement "${achievementData.name}" seeded.`);
        } else {
          console.log(`Cultural Achievement with name "${achievementData.name}" already exists. Skipping.`);
        }
      }
      console.log('CulturalAchievement seeder finished.');
    } catch (error) {
      console.error('Error seeding cultural achievements:', error);
    }
  }
}
