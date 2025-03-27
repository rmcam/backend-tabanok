import { Command, CommandRunner } from 'nest-commander';
import { SeedService } from './seed.service';

@Command({ name: 'seed', description: 'Seed the database' })
export class SeedCommand extends CommandRunner {
  constructor(private readonly seedService: SeedService) {
    super();
  }

  async run(): Promise<void> {
    try {
      console.log('Starting seeding...');
      await this.seedService.seedAll();
      console.log('Seeding completed successfully!');
    } catch (error) {
      console.error('Error seeding database:', error);
      throw error;
    }
  }
} 