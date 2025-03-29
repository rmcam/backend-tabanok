import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './features/account/account.module';
import { ActivityModule } from './features/activity/activity.module';
import { ContentModule } from './features/content/content.module';
import { ExercisesModule } from './features/exercises/exercises.module';
import { GamificationModule } from './features/gamification/gamification.module';
import { LessonModule } from './features/lesson/lesson.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { StatisticsModule } from './features/statistics/statistics.module';
import { TopicModule } from './features/topic/topic.module';
import { UnityModule } from './features/unity/unity.module';
import { UserModule } from './features/user/user.module';
import { VocabularyModule } from './features/vocabulary/vocabulary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        ssl: configService.get('DB_SSL') === 'true' ? {
          rejectUnauthorized: false
        } : false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    AccountModule,
    ActivityModule,
    ContentModule,
    ExercisesModule,
    GamificationModule,
    LessonModule,
    NotificationsModule,
    StatisticsModule,
    TopicModule,
    UnityModule,
    VocabularyModule,
  ]
})
export class AppModule { }
