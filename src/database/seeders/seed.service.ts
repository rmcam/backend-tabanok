import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from '../../features/topic/entities/topic.entity';
import { Unity } from '../../features/unity/entities/unity.entity';
import { Vocabulary } from '../../features/vocabulary/entities/vocabulary.entity';
import { UserSeeder } from './user.seeder'; // Import the user seeder
import { GamificationSeeder } from './gamification.seeder'; // Import the gamification seeder
import { ContentSeeder } from './content.seeder'; // Import the content seeder
import { MiscellaneousSeeder } from './miscellaneous.seeder'; // Import the miscellaneous seeder

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Unity)
    private readonly unityRepository: Repository<Unity>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(Vocabulary)
    private readonly vocabularyRepository: Repository<Vocabulary>,
    private readonly userSeeder: UserSeeder, // Inject the user seeder
    private readonly gamificationSeeder: GamificationSeeder, // Inject the gamification seeder
    private readonly contentSeeder: ContentSeeder, // Inject the content seeder
    private readonly miscellaneousSeeder: MiscellaneousSeeder, // Inject the miscellaneous seeder
  ) { }

  async seed() {
    console.log('Starting database seeding...');
    await this.userSeeder.seed(); // Execute the user seeder first
    await this.gamificationSeeder.seed(); // Execute the gamification seeder
    await this.contentSeeder.seed(); // Execute the content seeder
    await this.miscellaneousSeeder.seed(); // Execute the miscellaneous seeder
    // Removed individual seeders: seedInitialUnities, seedInitialTopics, seedInitialVocabulary
    console.log('Database seeding completed.');
  }

  // Removed individual seeder methods: seedInitialUnities, seedInitialTopics, seedInitialVocabulary, seedUnity, seedTopic, seedVocabulary
}
