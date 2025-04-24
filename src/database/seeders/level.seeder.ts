import { UserLevel } from '../../features/gamification/entities/user-level.entity';
import { DataSource } from 'typeorm';

export const LevelSeeder = {
  async seed(dataSource: DataSource): Promise<void> {
    const levelRepository = dataSource.getRepository(UserLevel);

    // Check if levels already exist
    const existingLevels = await levelRepository.count();
    if (existingLevels > 0) {
      console.log('Levels already exist, skipping seeding...');
      return;
    }

    const levels = [
      { currentLevel: 1, experienceToNextLevel: 0 },
      { currentLevel: 2, experienceToNextLevel: 100 },
      { currentLevel: 3, experienceToNextLevel: 250 },
      { currentLevel: 4, experienceToNextLevel: 500 },
      { currentLevel: 5, experienceToNextLevel: 1000 },
    ];

    await levelRepository.insert(levels);
    console.log('Levels seeded successfully!');
  },
};
