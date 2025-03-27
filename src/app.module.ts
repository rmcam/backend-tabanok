import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { BreedsModule } from './breeds/breeds.module';
import { CatsModule } from './cats/cats.module';
import { UserModule } from './user/user.module';

import { AccountModule } from './account/account.module';
import { ActivityModule } from './features/activity/activity.module';
import { LessonModule } from './features/lesson/lesson.module';
import { ProgressModule } from './features/progress/progress.module';
import { RewardModule } from './features/reward/reward.module';
import { TopicModule } from './features/topic/topic.module';
import { UnityModule } from './features/unity/unity.module';
import { VocabularyModule } from './features/vocabulary/vocabulary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Activamos synchronize temporalmente
      ssl: process.env.DB_SSL === 'true',
      logging: true,
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
    VocabularyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
