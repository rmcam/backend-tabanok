import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { TypeOrmConfigService } from './config/typeorm.config';
import { AccountModule } from './features/account/account.module';
import { AuthModule } from './features/auth/auth.module';
import { AutoGradingModule } from './features/auto-grading/auto-grading.module';
import { ContentModule } from './features/content/content.module';
import { CulturalContentModule } from './features/cultural-content/cultural-content.module';
import { EvaluationModule } from './features/evaluation/evaluation.module';
import { ExerciseModule } from './features/exercise/exercise.module';
import { LessonModule } from './features/lesson/lesson.module';
import { ProgressModule } from './features/progress/progress.module';
import { RewardModule } from './features/reward/reward.module';
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
      useClass: TypeOrmConfigService,
    }),
    AccountModule,
    AuthModule,
    ContentModule,
    CulturalContentModule,
    ExerciseModule,
    LessonModule,
    ProgressModule,
    RewardModule,
    TopicModule,
    UnityModule,
    UserModule,
    VocabularyModule,
    EvaluationModule,
    AutoGradingModule,
  ],
  controllers: [AppController],
})
export class AppModule { }
