import { Command, CommandRunner } from "nest-commander";
import { DataSource } from "typeorm";
import { AccountSeeder } from "./account.seeder";
import { AchievementProgressSeeder } from "./achievement-progress.seeder";
import { AchievementSeeder } from "./achievement.seeder";
import { ActivitySeeder } from "./activity.seeder";
import { BadgeSeeder } from "./badge.seeder";
import { BaseAchievementSeeder } from "./base-achievement.seeder";
import { CollaborationRewardSeeder } from "./collaboration-reward.seeder";
import { ContentVersionSeeder } from "./content-version.seeder";
import { ContentSeeder } from "./content.seeder";
import { ContentMultimediaSeeder } from "./content_multimedia.seeder";
import { ContentValidationSeeder } from "./content_validation.seeder";
import { CulturalAchievementSeeder } from "./cultural-achievement.seeder";
import { CulturalContentSeeder } from "./cultural_content.seeder";
import { DataSourceAwareSeed } from "./data-source-aware-seed";
import { ExerciseSeeder } from "./exercise.seeder";
import { GamificationSeeder } from "./gamification.seeder";
import { GamificationAchievementsAchievementsSeeder } from "./gamification_achievements_achievements.seeder";
import { LeaderboardSeeder } from "./leaderboard.seeder";
import { LessonSeeder } from "./lesson.seeder";
import { MentorSpecializationSeeder } from "./mentor-specialization.seeder";
import { MentorSeeder } from "./mentor.seeder";
import { MentorshipRelationSeeder } from "./mentorship-relation.seeder";
import { MissionTemplateSeeder } from "./mission-template.seeder";
import { MissionSeeder } from "./mission.seeder";
import { ModuleSeeder } from "./module.seeder";
import { MultimediaSeeder } from "./multimedia.seeder";
import { NotificationSeeder } from "./notification.seeder";
import { ProgressSeeder } from "./progress.seeder";
import { RevokedTokenSeeder } from "./revoked-token.seeder";
import { RewardSeeder } from "./reward.seeder";
import { SeasonSeeder } from "./season.seeder";
import { SpecialEventSeeder } from "./special-event.seeder";
import { TagSeeder } from "./statistics-tag.seeder";
import { StatisticsSeeder } from "./statistics.seeder";
import { StreakSeeder } from "./streak.seeder";
import { TopicSeeder } from "./topic.seeder";
import { UnitySeeder } from "./unity.seeder";
import { UserAchievementSeeder } from "./user-achievement.seeder";
import { UserBadgeSeeder } from "./user-badge.seeder";
import { UserLevelSeeder } from "./user-level.seeder";
import { UserMissionSeeder } from "./user-mission.seeder";
import { UserRewardSeeder } from "./user-reward.seeder";
import { UserSeeder } from "./user.seeder";
import { VocabularySeeder } from "./vocabulary.seeder";
import { WebhookSubscriptionSeeder } from "./webhook-subscription.seeder";

@Command({ name: "seed", description: "Runs database seeders" })
export class SeedCommand extends CommandRunner {
  constructor(private readonly dataSource: DataSource) {
    super();
  }

  async run(): Promise<void> {
    console.log("[SeedCommand] Starting database seeding process...");
    console.log("[SeedCommand] Checking data source initialization...");
    if (!this.dataSource.isInitialized) {
      console.log(
        "[SeedCommand] Data source is not initialized. Initializing..."
      );
      await this.dataSource.initialize();
      console.log("[SeedCommand] Data source initialized successfully.");
    } else {
      console.log("[SeedCommand] Data source already initialized.");
    }

    // Only run seeders if not in production environment
    if (process.env.NODE_ENV !== "production") {
      console.warn("[SeedCommand] Running in non-production environment. This script will run migrations and seeders, which may affect existing data.");
      console.log("[SeedCommand] Running database migrations...");
      try {
        console.log("[SeedCommand] Running database migrations...");
        await this.dataSource.runMigrations();
        console.log("[SeedCommand] Database migrations finished successfully.");
      } catch (error) {
        console.error(
          "[SeedCommand] Database migrations failed with error:",
          error
        );
        console.error(
          "[SeedCommand] Database migrations error stack:",
          error.stack
        );
        console.warn("[SeedCommand] Migrations failed. Seeding process aborted.");
        return; // Stop execution if migrations fail
      }

      console.log("[SeedCommand] Running database seeders...");
      console.warn("[SeedCommand] Note: Some seeders may clear existing data in their respective tables before inserting new data. If you are experiencing unexpected data loss, please review the individual seeder files in src/database/seeders/.");

      // Explicitly define the execution order of seeders based on dependencies
      const orderedSeeders: DataSourceAwareSeed[] = [
        // Seeders básicos (sin dependencias o con dependencias mínimas)
        new UserSeeder(this.dataSource),
        new AccountSeeder(this.dataSource),
        new ModuleSeeder(this.dataSource),
        new UnitySeeder(this.dataSource),
        new TopicSeeder(this.dataSource),
        new SeasonSeeder(this.dataSource),
        new SpecialEventSeeder(this.dataSource),
        new TagSeeder(this.dataSource),
        new BaseAchievementSeeder(this.dataSource),
        new CulturalAchievementSeeder(this.dataSource),
        new BadgeSeeder(this.dataSource),
        new AchievementSeeder(this.dataSource),
        new RewardSeeder(this.dataSource),
        new MissionTemplateSeeder(this.dataSource),
        new RevokedTokenSeeder(this.dataSource),
        new GamificationSeeder(this.dataSource),
        new LeaderboardSeeder(this.dataSource),
        new MentorSeeder(this.dataSource),
        new CollaborationRewardSeeder(this.dataSource),
        new WebhookSubscriptionSeeder(this.dataSource),
        new StreakSeeder(this.dataSource),

        // Seeders con dependencias de primer nivel
        new LessonSeeder(this.dataSource),
        new ContentSeeder(this.dataSource),
        new VocabularySeeder(this.dataSource),
        new MultimediaSeeder(this.dataSource),
        new MentorSpecializationSeeder(this.dataSource),
        new MentorshipRelationSeeder(this.dataSource),
        new MissionSeeder(this.dataSource),
        new ExerciseSeeder(this.dataSource), // Mover aquí para que ContentMultimediaSeeder pueda usarlo

        // Seeders con dependencias de segundo nivel
        new ContentMultimediaSeeder(this.dataSource),
        new ContentVersionSeeder(this.dataSource),
        new ContentValidationSeeder(this.dataSource),
        new CulturalContentSeeder(this.dataSource),
        new ActivitySeeder(this.dataSource), // Depende de User, Content, Lesson

        // Seeders con dependenpcias de tercer nivel
        new UserLevelSeeder(this.dataSource),
        new UserRewardSeeder(this.dataSource),
        new UserAchievementSeeder(this.dataSource),
        new UserBadgeSeeder(this.dataSource),
        new UserMissionSeeder(this.dataSource),
        new GamificationAchievementsAchievementsSeeder(this.dataSource),
        new ProgressSeeder(this.dataSource),
        new AchievementProgressSeeder(this.dataSource),
        new StatisticsSeeder(this.dataSource),
      ];

      try {
        for (const seeder of orderedSeeders) {
          console.log(
            `[SeedCommand] Processing seeder: ${seeder.constructor.name}`
          );
          try {
            console.log(
              `[SeedCommand] Running seeder: ${seeder.constructor.name}`
            );
            console.log(
              `[SeedCommand] Before running seeder: ${seeder.constructor.name}`
            );
            const queryRunner = this.dataSource.createQueryRunner();
            console.log(
              `[SeedCommand] Seeder ${seeder.constructor.name} instantiated successfully.`
            );
            await queryRunner.connect();

            try {
              await queryRunner.startTransaction();
              console.log(
                `[SeedCommand] Attempting to run seeder: ${seeder.constructor.name}`
              );
              await seeder.run();
              console.log(
                `[SeedCommand] Successfully finished seeder: ${seeder.constructor.name}`
              );
              console.log(
                `[SeedCommand] After running seeder: ${seeder.constructor.name}`
              );
              console.log(
                `[SeedCommand] Seeder ${seeder.constructor.name} run successfully`
              );

              await queryRunner.commitTransaction();
              console.log(
                `[SeedCommand] Transaction committed for seeder: ${seeder.constructor.name}`
              );
            } catch (error) {
              await queryRunner.rollbackTransaction();
              console.error(
                `[SeedCommand] Seeder ${seeder.constructor.name} failed. Transaction rolled back.`,
                error
              );
              console.error(
                `[SeedCommand] Seeder ${seeder.constructor.name} failed with error: ${error.message}`
              );
            } finally {
              await queryRunner.release();
            }
          } catch (error) {
            console.error(
              `[SeedCommand] Seeder ${seeder.constructor.name} failed to instantiate or connect:`,
              error
            );
          }
        }

        console.log("[SeedCommand] Database seeding complete.");
      } catch (error) {
        console.error("[SeedCommand] General seeding error:", error);
        console.error(
          "[SeedCommand] General seeding error stack:",
          error.stack
        );
        throw error;
      } finally {
        if (this.dataSource.isInitialized) {
          await this.dataSource.destroy();
        }
        console.log("[SeedCommand] Database seeding process finished.");
      }
    } else {
      console.log("[SeedCommand] Running in production environment. Skipping database migrations and seeding.");
    }
  }
}
