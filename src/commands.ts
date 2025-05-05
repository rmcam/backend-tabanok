import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';
import { SeedCommand } from './database/seeders/seed';

async function bootstrap() {
  await CommandFactory.run(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
}

bootstrap();
