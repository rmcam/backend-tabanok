import { DataSource } from 'typeorm';
import { Badge } from '../../features/gamification/entities/badge.entity';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import * as fs from 'fs';
import * as path from 'path';

export class BadgeSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const badgeRepository = this.dataSource.getRepository(Badge);
    const badgesJsonPath = path.resolve(__dirname, '../files/json/badges.json');

    try {
      const badgesJsonContent = JSON.parse(fs.readFileSync(badgesJsonPath, 'utf-8'));

      for (const badgeData of badgesJsonContent) {
        const existingBadge = await badgeRepository.findOne({ where: { name: badgeData.name } });

        if (!existingBadge) {
          const newBadge = badgeRepository.create({
            name: badgeData.name,
            description: badgeData.description,
            category: badgeData.category,
            tier: badgeData.tier,
            requiredPoints: badgeData.requiredPoints,
            iconUrl: badgeData.iconUrl,
            requirements: badgeData.requirements,
            isSpecial: badgeData.isSpecial,
            benefits: badgeData.benefits,
          });
          await badgeRepository.save(newBadge);
          console.log(`Badge "${badgeData.name}" seeded.`);
        } else {
          console.log(`Badge "${badgeData.name}" already exists. Skipping.`);
        }
      }
      console.log('Badge seeder finished.');
    } catch (error) {
      console.error('Error seeding badges:', error);
    }
  }
}
