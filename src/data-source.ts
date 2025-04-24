import { User } from '@/auth/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { Account } from './features/account/entities/account.entity';
import { Content } from './features/content/entities/content.entity';
import { CulturalContent } from './features/cultural-content/cultural-content.entity';
import { Statistics } from './features/statistics/entities/statistics.entity';
import { Evaluation } from './features/evaluation/evaluation.entity';
import { Exercise } from './features/exercises/entities/exercise.entity';
import { Achievement } from './features/gamification/entities/achievement.entity';
import { Multimedia } from './features/multimedia/entities/multimedia.entity';
import { Badge } from './features/gamification/entities/badge.entity';
import { CulturalAchievement } from './features/gamification/entities/cultural-achievement.entity';
import { Gamification } from './features/gamification/entities/gamification.entity';
import { Leaderboard } from './features/gamification/entities/leaderboard.entity';
import { Mission } from './features/gamification/entities/mission.entity';
import { Season } from './features/gamification/entities/season.entity';
import { SpecialEvent } from './features/gamification/entities/special-event.entity';
import { UserAchievement } from './features/gamification/entities/user-achievement.entity';
import { UserLevel } from './features/gamification/entities/user-level.entity';
import { UserMission } from './features/gamification/entities/user-mission.entity';
import { UserReward } from './features/gamification/entities/user-reward.entity';
import { Lesson } from './features/lesson/entities/lesson.entity';
import { Progress } from './features/progress/entities/progress.entity';
import { Reward } from './features/reward/entities/reward.entity';
import { Topic } from './features/topic/entities/topic.entity';
import { Unity } from './features/unity/entities/unity.entity';
import { Vocabulary } from './features/vocabulary/entities/vocabulary.entity';
import { Activity } from './features/activity/entities/activity.entity';

config();

const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = (() => {
  const databaseUrl = configService.get<string>('DATABASE_URL');

  const baseConfig = {
    type: 'postgres',
    entities: [
      Account,
      Content,
      CulturalContent,
      Exercise,
      Evaluation,
      Lesson,
      Multimedia,
      Progress,
      Reward,
      Topic,
      Unity,
      User,
      Statistics,
      Vocabulary,
      Gamification,
      Activity,
      Mission,
      UserReward,
      UserAchievement,
      Achievement,
      CulturalAchievement,
      Leaderboard,
      Season,
      SpecialEvent,
      Badge,
      UserLevel,
      UserMission,
    ],
    synchronize: false,
    logging: configService.get('NODE_ENV') === 'development',
    logger: 'advanced-console',
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
    extra: {
      max: configService.get('DB_MAX_CONNECTIONS', 100),
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 60000,
    },
  };

  if (databaseUrl) {
    return {
      ...baseConfig,
      url: databaseUrl,
      database: configService.get('DB_NAME') || '',
      ssl: configService.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
    } as DataSourceOptions;
  } else {
    return {
      ...baseConfig,
      host: configService.get('DB_HOST'),
      port: configService.get('DB_PORT'),
      username: configService.get('DB_USER'),
      password: configService.get('DB_PASSWORD'),
      database: configService.get('DB_NAME'),
      ssl: configService.get('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
    } as DataSourceOptions;
  }
})();

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
