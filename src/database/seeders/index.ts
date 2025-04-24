import { LevelSeeder } from './level.seeder';
import { DataSource } from 'typeorm';

export const seeders = [
  LevelSeeder,
];

export const runSeeders = async (dataSource: DataSource): Promise<void> => {
  for (const seeder of seeders) {
    if (seeder.seed) {
      await seeder.seed(dataSource);
    }
  }
};
