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
      __dirname + '/../**/*.entity.ts', // Usar glob para detectar entidades
    ],
    synchronize: false, // Deshabilitar sincronización automática
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
    
    /* migrations: [__dirname + '/database/migrations/*.ts'], */
    extra: {
      max: configService.get("DB_MAX_CONNECTIONS", 100),
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 60000,
    },
  };

  return {
    ...baseConfig,
    url: databaseUrl,
    ssl:
      configService.get("DB_SSL") === "true"
        ? { rejectUnauthorized: false }
        : false,
  } as DataSourceOptions;
})();

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
