import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { AuthModule } from './auth/auth.module';
import { AccountModule } from './features/account/account.module';
import { ActivityModule } from './features/activity/activity.module';
import { ContentModule } from './features/content/content.module';
import { ExercisesModule } from './features/exercises/exercises.module';
import { GamificationModule } from './features/gamification/gamification.module';
import { KamentsaValidatorService } from './features/language-validation/kamentsa-validator.service';
import { LanguageValidationController } from './features/language-validation/language-validation.controller';
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
      useFactory: (configService: ConfigService) =>
        ({
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: +configService.get('DB_PORT'),
          username: configService.get('DB_USER'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
          autoLoadEntities: true,
          synchronize: false, // <-- Cambiado a false para producción
          logging: configService.get<boolean>('DB_LOGGING', false), // <-- Hecho configurable, default false
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          ssl:
            configService.get('DB_SSL') === 'true'
              ? {
                  rejectUnauthorized: false,
                }
              : false,
          migrations: [__dirname + '/../migrations/*{.ts,.js}'], // Añadir ruta de migraciones
          migrationsRun: false, // Asegurarse de que no corra migraciones automáticamente al iniciar
        } as PostgresConnectionOptions),
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
  ],
  controllers: [LanguageValidationController],
  providers: [KamentsaValidatorService],
})
export class AppModule {}
