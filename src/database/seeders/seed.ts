import { Command, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { UserSeeder } from './user.seeder';
import { AccountSeeder } from './account.seeder';
import { BadgeSeeder } from './badge.seeder';
import { BaseAchievementSeeder } from './base-achievement.seeder';
import { AchievementSeeder } from './achievement.seeder';
import { ActivitySeeder } from './activity.seeder';
import { CollaborationRewardSeeder } from './collaboration-reward.seeder';
import { WebhookSubscriptionSeeder } from './webhook-subscription.seeder';
import { CulturalAchievementSeeder } from './cultural-achievement.seeder';
import { GamificationSeeder } from './gamification.seeder';
import { ContentSeeder } from './content.seeder';
import { LeaderboardSeeder } from './leaderboard.seeder';
import { MentorSpecializationSeeder } from './mentor-specialization.seeder';
import { MentorSeeder } from './mentor.seeder';
import { MentorshipRelationSeeder } from './mentorship-relation.seeder';
import { MissionTemplateSeeder } from './mission-template.seeder';
import { MissionSeeder } from './mission.seeder';
import { ModuleSeeder } from './module.seeder';
import { LessonSeeder } from './lesson.seeder';
import { MultimediaSeeder } from './multimedia.seeder';
import { NotificationSeeder } from './notification.seeder';
import { ProgressSeeder } from './progress.seeder';
import { RevokedTokenSeeder } from './revoked-token.seeder';
import { RewardSeeder } from './reward.seeder';
import { SeasonSeeder } from './season.seeder';
import { SpecialEventSeeder } from './special-event.seeder';
import { TagSeeder } from './statistics-tag.seeder';
import { StatisticsSeeder } from './statistics.seeder';
import { StreakSeeder } from './streak.seeder';
import { TopicSeeder } from './topic.seeder';
import { UnitySeeder } from './unity.seeder';
import { UserAchievementSeeder } from './user-achievement.seeder';
import { UserBadgeSeeder } from './user-badge.seeder';
import { UserLevelSeeder } from './user-level.seeder';
import { UserMissionSeeder } from './user-mission.seeder';
import { UserRewardSeeder } from './user-reward.seeder';
import { ContentVersionSeeder } from './content-version.seeder';
import { ExerciseSeeder } from './exercise.seeder';
import { VocabularySeeder } from './vocabulary.seeder';
import { CommentSeeder } from './comment.seeder';
import { AchievementProgressSeeder } from './achievement-progress.seeder';


@Command({ name: 'seed', description: 'Runs database seeders' })
export class SeedCommand extends CommandRunner {
  constructor(private readonly dataSource: DataSource) {
    super();
  }

  async run(): Promise<void> {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }

    console.log('Running database migrations...');
    await this.dataSource.runMigrations();
    console.log('Database migrations finished.');

    console.log('Truncating tables...');
    // Truncate tables in reverse order of dependencies
    const tablesToTruncate = [
      'user_rewards', // Depends on users and rewards
      'user_missions', // Depends on users and missions
      'user_badges', // Depends on users and badges
      'user_achievements', // Depends on users and achievements
      'mentorship_relations', // Depends on users and mentors
      'missions', // Depends on mission_templates and users
      'streaks', // Depends on users
      'notifications', // Depends on users, achievements, missions, collaboration_rewards
      'comments', // Depends on users and content_versions
      'multimedia', // Depends on lessons and users
      'progress', // Depends on users and exercises
      'lessons', // Depends on unities and topics
      'content_validation',
      'content_versions', // Depends on content
      'content', // Depends on unities and topics
      'activity', // Depends on users
      'exercises', // Depends on activity and topics
      'vocabulary', // Depends on topics
      'topics', // Depends on unities
      'unities', // Depends on modules
      'modules',
      'rewards', // Depends on badges and achievements
      'achievement_progress', // Depends on users and cultural_achievements
      'cultural_achievements',
      'achievements', // Depends on badges
      'base_achievements',
      'badges',
      'mission_templates',
      'special_events', // Depends on seasons
      'seasons',
      'collaboration_rewards',
      'mentors', // Depends on users and mentor_specializations
      'mentor_specializations',
      'accounts', // Depends on users
      'statistics', // Depends on users
      'webhook_subscriptions',
      'leaderboards',
      'users', // Truncate users last as many tables depend on it
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
    console.log('Tables truncated.');

    // Explicitly define the execution order of seeders
    const orderedSeeders: DataSourceAwareSeed[] = [
      // Seeders de entidades sin dependencias o con pocas dependencias
      new UserSeeder(this.dataSource),
      new AccountSeeder(this.dataSource), // Depends on User
      new BadgeSeeder(this.dataSource),
      new BaseAchievementSeeder(this.dataSource),
      new AchievementSeeder(this.dataSource), // Depends on Badge
      new ActivitySeeder(this.dataSource), // Depends on User
      new CollaborationRewardSeeder(this.dataSource),
      new WebhookSubscriptionSeeder(this.dataSource),
      new CulturalAchievementSeeder(this.dataSource),
      new GamificationSeeder(this.dataSource), // Depends on User
      new LeaderboardSeeder(this.dataSource),
      new MentorSpecializationSeeder(this.dataSource),
      new MentorSeeder(this.dataSource), // Depends on User and MentorSpecialization
      new MentorshipRelationSeeder(this.dataSource), // Depends on User and Mentor
      new ModuleSeeder(this.dataSource),
      new MissionTemplateSeeder(this.dataSource),
      new MissionSeeder(this.dataSource), // Depends on MissionTemplate and User
      new SeasonSeeder(this.dataSource),
      new SpecialEventSeeder(this.dataSource), // Depends on Season
      new TagSeeder(this.dataSource),
      new UnitySeeder(this.dataSource), // Depends on Module
      new TopicSeeder(this.dataSource), // Depends on Unity
      new ContentSeeder(this.dataSource), // Depends on Unity and Topic
      new ContentVersionSeeder(this.dataSource), // Depends on Content
      new CommentSeeder(this.dataSource), // Depends on User and ContentVersion
      new LessonSeeder(this.dataSource), // Depends on Unity and Topic
      new MultimediaSeeder(this.dataSource), // Depends on Lesson and User
      new ExerciseSeeder(this.dataSource), // Depends on Activity and Topic
      new ProgressSeeder(this.dataSource), // Depends on User and Exercise
      new VocabularySeeder(this.dataSource), // Depends on Topic
      new RewardSeeder(this.dataSource), // Depends on Badge and Achievement
      new NotificationSeeder(this.dataSource), // Depends on User, Achievement, Mission, CollaborationReward
      new RevokedTokenSeeder(this.dataSource),
      new StatisticsSeeder(this.dataSource), // Depends on User
      new StreakSeeder(this.dataSource), // Depends on User
      new UserLevelSeeder(this.dataSource), // Depends on User (assuming UserLevel is related to User)
      new UserAchievementSeeder(this.dataSource), // Depends on User and Achievement
      new UserBadgeSeeder(this.dataSource), // Depends on User and Badge
      new UserMissionSeeder(this.dataSource), // Depends on User and Mission
      new UserRewardSeeder(this.dataSource), // Depends on User and Reward
      new AchievementProgressSeeder(this.dataSource), // Depends on User and CulturalAchievement
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
      console.log('Database seeding complete.');

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Database seeding failed. Transaction rolled back.', error);
      throw error; // Re-throw the error after rollback
    } finally {
      await queryRunner.release();
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
      }
    }
  }
}
