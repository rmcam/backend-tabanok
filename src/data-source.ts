import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Activity } from './activities/entities/activity.entity';
import { Topic } from './features/topic/entities/topic.entity';
import { Vocabulary } from './features/vocabulary/entities/vocabulary.entity';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [Activity, Topic, Vocabulary],
  migrations: ['src/migrations/*{.ts,.js}'],
  ssl: configService.get('DB_SSL') === 'true',
}); 