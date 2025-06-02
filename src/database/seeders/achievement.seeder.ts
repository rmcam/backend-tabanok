import { DataSource } from 'typeorm';
import { Achievement } from '../../features/gamification/entities/achievement.entity';
import { Badge } from '../../features/gamification/entities/badge.entity';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import * as fs from 'fs';
import * as path from 'path';

export class AchievementSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const achievementRepository = this.dataSource.getRepository(Achievement);
    const badgeRepository = this.dataSource.getRepository(Badge);
    const achievementsJsonPath = path.resolve(__dirname, '../files/json/achievements.json');

    try {
      const achievementsJsonContent = JSON.parse(fs.readFileSync(achievementsJsonPath, 'utf-8'));
      const achievementsToInsert: Achievement[] = [];

      for (const achievementData of achievementsJsonContent) {
        const existingAchievement = await achievementRepository.findOne({ where: { name: achievementData.name } });

        if (!existingAchievement) {
          const badge = achievementData.badgeName
            ? (await badgeRepository.findOne({ where: { name: achievementData.badgeName } }))
            : null;

          const newAchievement = achievementRepository.create({
            name: achievementData.name,
            description: achievementData.description,
            iconUrl: achievementData.iconUrl,
            criteria: achievementData.criteria,
            requirement: achievementData.requirement,
            bonusPoints: achievementData.bonusPoints,
            badge: badge || null,
            isSecret: achievementData.isSecret || false,
            isSpecial: achievementData.isSpecial || false,
          });
          achievementsToInsert.push(newAchievement);
        } else {
          console.log(`Achievement "${achievementData.name}" already exists. Skipping.`);
        }
      }

      if (achievementsToInsert.length > 0) {
        await achievementRepository.save(achievementsToInsert);
        console.log(`Seeded ${achievementsToInsert.length} new achievements.`);
      } else {
        console.log('No new achievements to seed.');
      }
    } catch (error) {
      console.error('Error seeding achievements:', error);
    }
  }
}
