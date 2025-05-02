import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, Reflector } from "@nestjs/core"; // Importar APP_GUARD y Reflector
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth/auth.controller";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard"; // Importar JwtAuthGuard
import { TypeOrmConfigService } from "./config/typeorm.config";
import { AccountModule } from "./features/account/account.module";
import { ActivityModule } from "./features/activity/activity.module";
import { ContentModule } from "./features/content/content.module";
import { CulturalContentModule } from "./features/cultural-content/cultural-content.module";
import { DictionaryModule } from "./features/dictionary/dictionary.module";
import { ExercisesModule } from "./features/exercises/exercises.module";
import { GamificationModule } from "./features/gamification/gamification.module";
import { KamentsaValidatorService } from "./features/language-validation/kamentsa-validator.service";
import { LanguageValidationController } from "./features/language-validation/language-validation.controller";
import { LessonModule } from "./features/lesson/lesson.module";
import { MultimediaModule } from "./features/multimedia/multimedia.module";
import { NotificationsModule } from "./features/notifications/notifications.module";
import { RecommendationsModule } from "./features/recommendations/recommendations.module";
import { StatisticsModule } from "./features/statistics/statistics.module";
import { TopicModule } from "./features/topic/topic.module";
import { UnityModule } from "./features/unity/unity.module";
import { UserModule } from "./features/user/user.module";
import { VocabularyModule } from "./features/vocabulary/vocabulary.module";
import { RootController } from "./root.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      ignoreEnvFile: false,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
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
    RecommendationsModule,
    DictionaryModule,
    CulturalContentModule,
    MultimediaModule,
    ModuleModule,
    AnalyticsModule,
  ],
  controllers: [LanguageValidationController, RootController, AuthController],
  providers: [
    KamentsaValidatorService,
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => new JwtAuthGuard(reflector),
      inject: [Reflector],
    },
    // Si necesitas aplicar RolesGuard globalmente de nuevo, hazlo aquí
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
  ],
})
export class AppModule {}
