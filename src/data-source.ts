import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Account } from './features/account/entities/account.entity';
import { Content } from './features/content/entities/content.entity';
import { CulturalContent } from './features/cultural-content/cultural-content.entity';
import { Evaluation } from './features/evaluation/evaluation.entity';
import { Exercise } from './features/exercises/entities/exercise.entity';
import { Gamification } from './features/gamification/entities/gamification.entity';
import { Mission } from './features/gamification/entities/mission.entity';
import { Lesson } from './features/lesson/entities/lesson.entity';
import { Progress } from './features/progress/entities/progress.entity';
import { Reward } from './features/reward/entities/reward.entity';
import { Topic } from './features/topic/entities/topic.entity';
import { Unity } from './features/unity/entities/unity.entity';
import { User } from './auth/entities/user.entity';
import { Vocabulary } from './features/vocabulary/entities/vocabulary.entity';

config();

const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get('DB_PORT'),
  username: configService.get('DB_USER'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  entities: [
    Account,
    Content,
    CulturalContent,
    Exercise,
    Evaluation,
    Lesson,
    Progress,
    Reward,
    Topic,
    Unity,
    User,
    Vocabulary,
    Gamification,
    Mission,
  ],
  migrations: ['dist/migrations/*.js', 'src/migrations/*.ts'],
  synchronize: false,
  ssl: configService.get('DB_SSL') === 'true',
  extra: {
    max: configService.get('DB_MAX_CONNECTIONS', 100),
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 60000,
  },
  cache: {
    type: 'ioredis',
    options: {
      host: configService.get('REDIS_HOST', 'localhost'),
      port: configService.get('REDIS_PORT', 6379),
      password: configService.get('REDIS_PASSWORD', ''),
      db: 0,
    },
    duration: 60000,
  },
  logging: configService.get('NODE_ENV') === 'development',
  logger: 'advanced-console',
  replication: {
    master: {
      host: configService.get('DB_HOST'),
      port: configService.get('DB_PORT'),
      username: configService.get('DB_USER'),
      password: configService.get('DB_PASSWORD'),
      database: configService.get('DB_NAME'),
    },
    slaves: configService.get('DB_SLAVES', []).map(slave => ({
      host: slave.host,
      port: slave.port,
      username: slave.username,
      password: slave.password,
      database: slave.database,
    })),
  },
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
