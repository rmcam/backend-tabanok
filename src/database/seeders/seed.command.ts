import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { SeedService } from './seed.service';

@Injectable()
export class SeedCommand {
  constructor(private readonly seedService: SeedService) { }

  @Command({
    command: 'seed',
    describe: 'Seed the database with initial data',
  })
  async seed() {
    await this.seedService.seed();
    console.log('Database seeded successfully');
  }
} 