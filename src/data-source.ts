import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";


config();

const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = (() => {
  const databaseUrl = configService.get<string>("DATABASE_URL");

  const baseConfig = {
    type: "postgres",
    entities: [
      __dirname + '/auth/entities/revoked-token.entity.js',
      __dirname + '/auth/entities/user.entity.js',
      __dirname + '/features/activity/entities/user-activity.entity.js',
      __dirname + '/features/gamification/entities/leaderboard.entity.js',
      __dirname + '/features/gamification/entities/reward.entity.js',
      __dirname + '/features/gamification/entities/achievement-progress.entity.js',
      __dirname + '/features/gamification/entities/achievement.entity.js',
      __dirname + '/features/gamification/entities/badge.entity.js',
      __dirname + '/features/gamification/entities/cultural-achievement.entity.js',
      __dirname + '/features/gamification/entities/gamification.entity.js',
      __dirname + '/features/gamification/entities/mentor-specialization.entity.js',
      __dirname + '/features/gamification/entities/mentor.entity.js',
      __dirname + '/features/gamification/entities/mentorship-relation.entity.js',
      __dirname + '/features/gamification/entities/mission.entity.js',
      __dirname + '/features/gamification/entities/user-achievement.entity.js',
      __dirname + '/features/gamification/entities/user-reward.entity.js',
      __dirname + '/features/gamification/entities/user-badge.entity.js',
      __dirname + '/features/gamification/entities/user-level.entity.js',
      __dirname + '/features/gamification/entities/streak.entity.js',
      __dirname + '/features/gamification/entities/user-mission.entity.js',
      __dirname + '/features/gamification/entities/mission-template.entity.js',
    ],
    synchronize: true,
    logging: configService.get("NODE_ENV") === "development",
    logger: "advanced-console",
    /* cache: {
       type: "ioredis",
       options: {
        host: configService.get("REDIS_HOST", "localhost"),
        port: configService.get("REDIS_PORT", 6379),
        password: configService.get("REDIS_PASSWORD", ""),
        db: 0,
      },
      duration: 60000,
    }, */
    
    migrations: [__dirname + '/database/migrations/*.js'],
    extra: {
      max: configService.get("DB_MAX_CONNECTIONS", 100),
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 60000,
    },
  };

  if (databaseUrl) {
    return {
      ...baseConfig,
      url: databaseUrl,
      database: configService.get("DB_NAME") || "",
      ssl:
        configService.get("DB_SSL") === "true"
          ? { rejectUnauthorized: false }
          : false,
    } as DataSourceOptions;
  } else {
    return {
      ...baseConfig,
      host: configService.get("DB_HOST"),
      port: configService.get("DB_PORT"),
      username: configService.get("DB_USER"),
      password: configService.get("DB_PASSWORD"),
      database: configService.get("DB_NAME"),
      ssl:
        configService.get("DB_SSL") === "true"
          ? { rejectUnauthorized: false }
          : false,
    } as DataSourceOptions;
  }
})();

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
