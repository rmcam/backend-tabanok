import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Account } from './features/account/entities/account.entity';
import { Content } from './features/content/entities/content.entity';
import { CulturalContent } from './features/cultural-content/cultural-content.entity';
import { Evaluation } from './features/evaluation/evaluation.entity';
import { Exercise } from './features/exercise/entities/exercise.entity';
import { Lesson } from './features/lesson/entities/lesson.entity';
import { Progress } from './features/progress/entities/progress.entity';
import { Reward } from './features/reward/entities/reward.entity';
import { Topic } from './features/topic/entities/topic.entity';
import { Unity } from './features/unity/entities/unity.entity';
import { User } from './features/user/entities/user.entity';
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
  ],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
  ssl: configService.get('DB_SSL') === 'true',
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource; 