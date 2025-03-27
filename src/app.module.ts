import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { BreedsModule } from './breeds/breeds.module';
import { CatsModule } from './cats/cats.module';
import { UserModule } from './user/user.module';

import { UnityModule } from './features/unity/unity.module';
import { LessonModule } from './features/lesson/lesson.module';
import { ProgressModule } from './features/progress/progress.module';
import { ActivityModule } from './features/activity/activity.module';
import { RewardModule } from './features/reward/reward.module';
import { TopicModule } from './features/topic/topic.module';
import { AccountModule } from './account/account.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      logging: true, // Habilita el registro de SQL
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
      ssl: process.env.DB_SSL === 'true',
      extra: {
        ssl:
          process.env.DB_SSL === 'true'
            ? {
                rejectUnauthorized: false,
              }
            : null,
      },
    }),
    CatsModule,
    BreedsModule,
    AuthModule,
    UnityModule,
    LessonModule,
    ProgressModule,
    ActivityModule,
    AccountModule,
    RewardModule,
    UserModule,
    TopicModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
