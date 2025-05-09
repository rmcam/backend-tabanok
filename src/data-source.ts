import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";
import { UserLevel } from './features/gamification/entities/user-level.entity'; // Importar UserLevel

config();

const configService = new ConfigService();

export const dataSourceOptions: DataSourceOptions = (() => {
  const databaseUrl = configService.get<string>("DATABASE_URL");

  const baseConfig = {
    type: "postgres",
    entities: [__dirname + "/**/*.entity{.ts,.js}"], // Use glob pattern relative to this file and add UserLevel
    synchronize: true,
    logging: configService.get("NODE_ENV") === "development",
    logger: "advanced-console",
    /*
    cache: {
      // type: "ioredis",
      // options: {
        host: configService.get("REDIS_HOST", "localhost"),
        port: configService.get("REDIS_PORT", 6379),
        password: configService.get("REDIS_PASSWORD", ""),
        db: 0,
      },
      duration: 60000,
    },
    */
    migrations: [],
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
