import { Command, CommandRunner } from "nest-commander";
import { DataSource } from "typeorm";
import { dataSourceOptions } from "../../data-source"; // Importar dataSourceOptions
import { AccountSeeder } from "./account.seeder"; // Importar seeders individuales aquí
import { AchievementProgressSeeder } from "./achievement-progress.seeder"; // Importar AchievementProgressSeeder
import { AchievementSeeder } from "./achievement.seeder"; // Importar AchievementSeeder
import { ActivitySeeder } from "./activity.seeder"; // Importar ActivitySeeder
import { BadgeSeeder } from "./badge.seeder"; // Importar BadgeSeeder
import CollaborationRewardSeeder from "./collaboration-reward.seeder"; // Importar CollaborationRewardSeeder
import { CommentSeeder } from "./comment.seeder"; // Importar CommentSeeder
import ContentValidationSeeder from "./content-validation.seeder"; // Importar ContentValidationSeeder
import { ContentVersionSeeder } from "./content-version.seeder"; // Importar ContentVersionSeeder
import { ContentSeeder } from "./content.seeder"; // Importar ContentSeeder
import { CulturalAchievementSeeder } from "./cultural-achievement.seeder"; // Importar CulturalAchievementSeeder
import { ExerciseSeeder } from "./exercise.seeder"; // Importar ExerciseSeeder
import GamificationSeeder from "./gamification.seeder"; // Importar GamificationSeeder
import { DataSourceAwareSeed } from "./index";
import LeaderboardSeeder from "./leaderboard.seeder"; // Importar LeaderboardSeeder
import { LessonSeeder } from "./lesson.seeder"; // Importar LessonSeeder
import MentorSpecializationSeeder from "./mentor-specialization.seeder"; // Importar MentorSpecializationSeeder
import MentorSeeder from "./mentor.seeder"; // Importar MentorSeeder
import MentorshipRelationSeeder from "./mentorship-relation.seeder"; // Importar MentorshipRelationSeeder
import { MissionTemplateSeeder } from "./mission-template.seeder"; // Importar MissionTemplateSeeder
import { ModuleSeeder } from "./module.seeder"; // Importar ModuleSeeder
import { MultimediaSeeder } from "./multimedia.seeder"; // Importar MultimediaSeeder
import NotificationSeeder from "./notification.seeder"; // Importar NotificationSeeder
import { ProgressSeeder } from "./progress.seeder"; // Importar ProgressSeeder
import RevokedTokenSeeder from "./revoked-token.seeder"; // Importar RevokedTokenSeeder
import { RewardSeeder } from "./reward.seeder"; // Importar RewardSeeder
import { SeasonSeeder } from "./season.seeder"; // Importar SeasonSeeder
import { SpecialEventSeeder } from "./special-event.seeder"; // Importar SpecialEventSeeder
import TagSeeder from "./statistics-tag.seeder"; // Importar TagSeeder
import { StatisticsSeeder } from "./statistics.seeder"; // Importar StatisticsSeeder
import StreakSeeder from "./streak.seeder"; // Importar StreakSeeder
import { TopicSeeder } from "./topic.seeder"; // Importar TopicSeeder
import { UnitySeeder } from "./unity.seeder"; // Importar UnitySeeder
import UserBadgeSeeder from "./user-badge.seeder"; // Importar UserBadgeSeeder
import { UserLevelSeeder } from "./user-level.seeder"; // Importar UserLevelSeeder
import UserMissionSeeder from "./user-mission.seeder"; // Importar UserMissionSeeder
import UserRewardSeeder from "./user-reward.seeder"; // Importar UserRewardSeeder
import { UserSeeder } from "./user.seeder"; // Importar seeders individuales aquí
import { VocabularySeeder } from "./vocabulary.seeder"; // Importar VocabularySeeder
import WebhookSubscriptionSeeder from "./webhook-subscription.seeder"; // Importar WebhookSubscriptionSeeder

@Command({ name: "seed", description: "Runs database seeders" })
export class SeedCommand extends CommandRunner {
  private readonly dataSource: DataSource; // Declarar dataSource aquí

  constructor() {
    // Eliminar inyección de DataSource
    super();
    // Inicializar DataSource localmente
    this.dataSource = new DataSource(dataSourceOptions);
  }

  async run(): Promise<void> {
    // Inicializar el DataSource antes de ejecutar los seeders
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }

    console.log("Running database migrations...");
    await this.dataSource.runMigrations();
    console.log("Database migrations finished.");

    console.log("Truncating tables...");
    // Truncate tables in reverse order of dependencies
    const tablesToTruncate = [
      "webhook_subscriptions",
      "statistics",
      "accounts",
      "mentors",
      "collaboration_rewards",
      "special_events",
      "mission_templates",
      "cultural_achievements",
      "achievements",
      "user_rewards", // Truncar user_rewards antes de rewards
      "rewards", // Truncar rewards después de user_rewards
      "vocabulary",
      "unities",
      "topics",
      "exercises",
      "activities",
      "content",
      "content_versions",
      "content_validation",
      "notifications",
      "leaderboards",
      "gamification",
      "streaks",
      "missions",
      "mentor_specializations",
      "mentorship_relations",
      "achievement_progress",
      "user_badges",
      "user_missions",
      "users", // Truncar users al final o antes de tablas que dependen de user
    ];

    for (const table of tablesToTruncate) {
      try {
        await this.dataSource.query(`TRUNCATE TABLE "${table}" CASCADE;`);
        console.log(`Truncated table: ${table}`);
      } catch (error) {
        console.error(`Error truncating table ${table}:`, error);
        // Depending on severity, you might want to throw the error or continue
      }
    }
    console.log("Tables truncated.");

    // Explicitly define the execution order of seeders based on dependencies
    const orderedSeeders: DataSourceAwareSeed[] = [
      // Seeders de entidades sin dependencias o con pocas dependencias
      new UserSeeder(this.dataSource),
      new AccountSeeder(this.dataSource),
      new ModuleSeeder(this.dataSource),
      new UnitySeeder(this.dataSource),
      new LessonSeeder(this.dataSource),
      new TopicSeeder(this.dataSource),
      new ActivitySeeder(this.dataSource),
      new ContentSeeder(this.dataSource),
      new ContentVersionSeeder(this.dataSource),
      new MultimediaSeeder(this.dataSource),
      new StatisticsSeeder(this.dataSource),
      new UserLevelSeeder(this.dataSource),
      new CommentSeeder(this.dataSource),
      new ExerciseSeeder(this.dataSource),
      new ProgressSeeder(this.dataSource),
      new VocabularySeeder(this.dataSource),
      new RevokedTokenSeeder(this.dataSource),
      new CollaborationRewardSeeder(this.dataSource),
      new GamificationSeeder(this.dataSource),
      new LeaderboardSeeder(this.dataSource),
      new MentorSeeder(this.dataSource),
      new MentorSpecializationSeeder(this.dataSource),
      new MentorshipRelationSeeder(this.dataSource),
      new MissionTemplateSeeder(this.dataSource),
      new SeasonSeeder(this.dataSource),
      new SpecialEventSeeder(this.dataSource),
      new ContentValidationSeeder(this.dataSource),
      new NotificationSeeder(this.dataSource),
      new TagSeeder(this.dataSource),
      new WebhookSubscriptionSeeder(this.dataSource),
      // Seeders con dependencias (orden corregido)
      new BadgeSeeder(this.dataSource), // Debe ir antes de Achievement y Reward
      new AchievementSeeder(this.dataSource), // Debe ir antes de Reward
      new CulturalAchievementSeeder(this.dataSource), // Debe ir antes de Reward
      new RewardSeeder(this.dataSource), // Debe ir antes de UserReward
      new UserRewardSeeder(this.dataSource), // Depende de Reward
      new AchievementProgressSeeder(this.dataSource), // Depende de Achievement y User
      new UserBadgeSeeder(this.dataSource), // Depende de User y Badge
      new UserMissionSeeder(this.dataSource), // Depende de User y Mission
      new StreakSeeder(this.dataSource), // Depende de User (colocado al final por si acaso)
    ];

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const seeder of orderedSeeders) {
        console.log(`Attempting to run seeder: ${seeder.constructor.name}`);
        await seeder.run();
        console.log(`Successfully finished seeder: ${seeder.constructor.name}`);
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(`Error during seeding process:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }

    console.log("Database seeding complete.");

    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }
}
