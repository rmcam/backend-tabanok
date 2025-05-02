import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLevel } from '../../features/gamification/entities/user-level.entity';

@Injectable()
export class LevelSeeder {
  constructor(
    @InjectRepository(UserLevel)
    private readonly levelRepository: Repository<UserLevel>,
  ) {}

  async seed(): Promise<void> {
    // Check if levels already exist
    const existingLevels = await this.levelRepository.count();
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

    await this.levelRepository.insert(levels);
    console.log('Levels seeded successfully!');
  }
}
