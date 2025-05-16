import { Command, CommandRunner } from "nest-commander";
import { DataSource } from "typeorm";
import { AccountSeeder } from "./account.seeder";
import { AchievementProgressSeeder } from "./achievement-progress.seeder";
import { AchievementSeeder } from "./achievement.seeder";
import { ActivitySeeder } from "./activity.seeder";
import { BadgeSeeder } from "./badge.seeder";
import { BaseAchievementSeeder } from "./base-achievement.seeder";
import { CollaborationRewardSeeder } from "./collaboration-reward.seeder";
import { CommentSeeder } from "./comment.seeder";
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
      console.log("[SeedCommand] Data source is not initialized. Initializing...");
      await this.dataSource.initialize();
      console.log("[SeedCommand] Data source initialized successfully.");
    } else {
      console.log("[SeedCommand] Data source already initialized.");
    }

    console.log("Running database migrations...");
    console.log("[SeedCommand] Running database migrations...");
    try {
      console.log("[SeedCommand] Running database migrations...");
      await this.dataSource.runMigrations();
      console.log("[SeedCommand] Database migrations finished successfully.");
    } catch (error) {
      console.error("[SeedCommand] Database migrations failed with error:", error);
      console.error("[SeedCommand] Database migrations error stack:", error.stack);
      return; // Stop execution if migrations fail
    }

    // Explicitly define the execution order of seeders based on dependencies
    const orderedSeeders: DataSourceAwareSeed[] = [
      // Seeders with no or minimal dependencies first
      new UserSeeder(this.dataSource),
      new AccountSeeder(this.dataSource),
      new ModuleSeeder(this.dataSource), 
      new UnitySeeder(this.dataSource),
      //new SeasonSeeder(this.dataSource),
      //new SpecialEventSeeder(this.dataSource),
      //new TagSeeder(this.dataSource),
      //new RewardSeeder(this.dataSource),
      //new NotificationSeeder(this.dataSource),
      //new RevokedTokenSeeder(this.dataSource),
      //new GamificationSeeder(this.dataSource),
      //new LeaderboardSeeder(this.dataSource),
      //new MentorSeeder(this.dataSource),
      //new MissionTemplateSeeder(this.dataSource),
      //new BaseAchievementSeeder(this.dataSource),
      //new CulturalAchievementSeeder(this.dataSource),

      // Seeders with dependencies on the above
      new TopicSeeder(this.dataSource), // Depends on Unity
      new ContentSeeder(this.dataSource), // Depends on Unity and Topic
      //new LessonSeeder(this.dataSource), // Depends on Unity
      //new ActivitySeeder(this.dataSource), // May depend on User, Content, etc. (needs verification)
      //new MultimediaSeeder(this.dataSource), // May have dependencies (needs verification)
      //new ContentMultimediaSeeder(this.dataSource), // Depends on Content and Multimedia
      //new ContentVersionSeeder(this.dataSource), // Depends on Content
      //new ContentValidationSeeder(this.dataSource), // Depends on Content (needs verification)
      //new CulturalContentSeeder(this.dataSource), // May have dependencies (needs verification)
      //new BadgeSeeder(this.dataSource), // May have dependencies (needs verification)
      //new AchievementSeeder(this.dataSource), // Depends on BaseAchievement
      //new CollaborationRewardSeeder(this.dataSource), // May have dependencies (needs verification)
      //new WebhookSubscriptionSeeder(this.dataSource), // May have dependencies (needs verification)
      //new MentorSpecializationSeeder(this.dataSource), // Depends on Mentor
      //new MentorshipRelationSeeder(this.dataSource), // Depends on Mentor and User
      //new MissionSeeder(this.dataSource), // Depends on Season and MissionTemplate
      //new VocabularySeeder(this.dataSource), // Depends on Topic
      //new StatisticsSeeder(this.dataSource), // May have dependencies (needs verification)
      //new StreakSeeder(this.dataSource), // May have dependencies (needs verification)
      //new UserLevelSeeder(this.dataSource), // Depends on User
      //new UserRewardSeeder(this.dataSource), // Depends on User and Reward
      //new UserAchievementSeeder(this.dataSource), // Depends on User and Achievement
      //new UserBadgeSeeder(this.dataSource), // Depends on User and Badge
      //new UserMissionSeeder(this.dataSource), // Depends on User and Mission
      //new AchievementProgressSeeder(this.dataSource), // Depends on UserAchievement
      //new GamificationAchievementsAchievementsSeeder(this.dataSource), // Depends on Gamification and Achievement
//
      //// Seeders with dependencies on Exercise (must come after ExerciseSeeder)
      //new ExerciseSeeder(this.dataSource), // Depends on Topic and Lesson
      //new ProgressSeeder(this.dataSource), // Depends on User and Exercise
    ];

    try {
      for (const seeder of orderedSeeders) {
        console.log(
          `[SeedCommand] Processing seeder: ${seeder.constructor.name}`
        );
        try {
          console.log(`[SeedCommand] Running seeder: ${seeder.constructor.name}`);
          console.log(`[SeedCommand] Before running seeder: ${seeder.constructor.name}`);
          const queryRunner = this.dataSource.createQueryRunner();
          console.log(
            `[SeedCommand] Seeder ${seeder.constructor.name} instantiated successfully.`
          );
          await queryRunner.connect();

          try {
            //await queryRunner.startTransaction();
            console.log(`[SeedCommand] Attempting to run seeder: ${seeder.constructor.name}`);
            await seeder.run();
            console.log(
              `[SeedCommand] Successfully finished seeder: ${seeder.constructor.name}`
            );
            console.log(`[SeedCommand] After running seeder: ${seeder.constructor.name}`);
            console.log(`[SeedCommand] Seeder ${seeder.constructor.name} run successfully`);

            //await queryRunner.commitTransaction();
            console.log(
              `[SeedCommand] Transaction committed for seeder: ${seeder.constructor.name}`
            );
          } catch (error) {
            //await queryRunner.rollbackTransaction();
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
          console.error(`[SeedCommand] Seeder ${seeder.constructor.name} failed to instantiate or connect:`, error);
        }
      }

      console.log("[SeedCommand] Database seeding complete.");
    } catch (error) {
      console.error("[SeedCommand] General seeding error:", error);
      console.error("[SeedCommand] General seeding error stack:", error.stack);
      throw error;
    } finally {
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
      }
      console.log("[SeedCommand] Database seeding process finished.");
    }
  }
}
