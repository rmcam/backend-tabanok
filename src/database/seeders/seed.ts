import { Command, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { UserSeeder } from './user.seeder'; // Importar seeders individuales aquí
import { dataSourceOptions } from '../../data-source'; // Importar dataSourceOptions
import { AccountSeeder } from './account.seeder'; // Importar seeders individuales aquí
import { ModuleSeeder } from './module.seeder'; // Importar ModuleSeeder
import { UnitySeeder } from './unity.seeder'; // Importar UnitySeeder
import { LessonSeeder } from './lesson.seeder'; // Importar LessonSeeder
import { TopicSeeder } from './topic.seeder'; // Importar TopicSeeder
import { ActivitySeeder } from './activity.seeder'; // Importar ActivitySeeder
import { ContentSeeder } from './content.seeder'; // Importar ContentSeeder
import { ContentVersionSeeder } from './content-version.seeder'; // Importar ContentVersionSeeder
import { MultimediaSeeder } from './multimedia.seeder'; // Importar MultimediaSeeder
import { StatisticsSeeder } from './statistics.seeder'; // Importar StatisticsSeeder
import { UserLevelSeeder } from './user-level.seeder'; // Importar UserLevelSeeder
import { CommentSeeder } from './comment.seeder'; // Importar CommentSeeder
import { ExerciseSeeder } from './exercise.seeder'; // Importar ExerciseSeeder
import { ProgressSeeder } from './progress.seeder'; // Importar ProgressSeeder
import { VocabularySeeder } from './vocabulary.seeder'; // Importar VocabularySeeder
import { RewardSeeder } from './reward.seeder'; // Importar RewardSeeder
import { AchievementSeeder } from './achievement.seeder'; // Importar AchievementSeeder
import { CulturalAchievementSeeder } from './cultural-achievement.seeder'; // Importar CulturalAchievementSeeder
import { AchievementProgressSeeder } from './achievement-progress.seeder'; // Importar AchievementProgressSeeder
import { BadgeSeeder } from './badge.seeder'; // Importar BadgeSeeder
import { MissionTemplateSeeder } from './mission-template.seeder'; // Importar MissionTemplateSeeder
import { SeasonSeeder } from './season.seeder'; // Importar SeasonSeeder
import { SpecialEventSeeder } from './special-event.seeder'; // Importar SpecialEventSeeder
import RevokedTokenSeeder from './revoked-token.seeder'; // Importar RevokedTokenSeeder
import CollaborationRewardSeeder from './collaboration-reward.seeder'; // Importar CollaborationRewardSeeder
import GamificationSeeder from './gamification.seeder'; // Importar GamificationSeeder
import LeaderboardSeeder from './leaderboard.seeder'; // Importar LeaderboardSeeder
import MentorSpecializationSeeder from './mentor-specialization.seeder'; // Importar MentorSpecializationSeeder
import MentorSeeder from './mentor.seeder'; // Importar MentorSeeder
import MentorshipRelationSeeder from './mentorship-relation.seeder'; // Importar MentorshipRelationSeeder
import MissionSeeder from './mission.seeder'; // Importar MissionSeeder
import StreakSeeder from './streak.seeder'; // Importar StreakSeeder
import UserAchievementSeeder from './user-achievement.seeder'; // Importar UserAchievementSeeder
import UserBadgeSeeder from './user-badge.seeder'; // Importar UserBadgeSeeder
import UserMissionSeeder from './user-mission.seeder'; // Importar UserMissionSeeder
import UserRewardSeeder from './user-reward.seeder'; // Importar UserRewardSeeder
import ContentValidationSeeder from './content-validation.seeder'; // Importar ContentValidationSeeder
import NotificationSeeder from './notification.seeder'; // Importar NotificationSeeder
import TagSeeder from './statistics-tag.seeder'; // Importar TagSeeder
import WebhookSubscriptionSeeder from './webhook-subscription.seeder'; // Importar WebhookSubscriptionSeeder
import { Comment } from '../../features/comments/entities/comment.entity'; // Importar la entidad Comment (ruta corregida)
import { UserLevel } from '../../features/gamification/entities/user-level.entity'; // Importar la entidad UserLevel explícitamente

@Command({ name: 'seed', description: 'Runs database seeders' })
export class SeedCommand extends CommandRunner {
  private readonly dataSource: DataSource; // Declarar dataSource aquí

  constructor() { // Eliminar inyección de DataSource
    super();
    // Inicializar DataSource localmente
    this.dataSource = new DataSource(dataSourceOptions);
  }

  async run(): Promise<void> {
    // Inicializar el DataSource antes de ejecutar los seeders
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }

    console.log('Running database migrations...');
    await this.dataSource.runMigrations();
    console.log('Database migrations finished.');

    console.log('Truncating tables...');
    // Truncate tables in reverse order of dependencies
    const tablesToTruncate = [
      'webhook_subscriptions',
      'statistics',
      'accounts',
      'mentors',
      'collaboration_rewards',
      'special_events',
      'mission_templates',
      'cultural_achievements',
      'achievements',
      'rewards', // Truncar rewards antes que user_rewards
      'vocabulary',
      'unities',
      'topics',
      'exercises',
      'activities',
      'content',
      'content_versions',
      'content_validation',
      'notifications',
      'leaderboards',
      'gamification',
      'streaks',
      'missions',
      'mentor_specializations',
      'mentorship_relations',
      'achievement_progress',
      'user_badges',
      'user_missions',
      'user_rewards', // Truncar user_rewards después de rewards
      'users', // Truncar users al final o antes de tablas que dependen de user
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
      new BadgeSeeder(this.dataSource), // BadgeSeeder antes que RewardSeeder
      new AchievementSeeder(this.dataSource), // AchievementSeeder antes que RewardSeeder
      new CulturalAchievementSeeder(this.dataSource), // CulturalAchievementSeeder antes que RewardSeeder
      new RewardSeeder(this.dataSource), // RewardSeeder después de Badge y Achievement
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
      new AchievementProgressSeeder(this.dataSource),
      new MissionTemplateSeeder(this.dataSource),
      new SeasonSeeder(this.dataSource),
      new SpecialEventSeeder(this.dataSource),
      new RevokedTokenSeeder(this.dataSource),
      new CollaborationRewardSeeder(this.dataSource),
      new GamificationSeeder(this.dataSource),
      new LeaderboardSeeder(this.dataSource),
      new MentorSeeder(this.dataSource),
      new MentorSpecializationSeeder(this.dataSource),
      new MentorshipRelationSeeder(this.dataSource),
      new MissionSeeder(this.dataSource),
      new StreakSeeder(this.dataSource),
      new UserBadgeSeeder(this.dataSource),
      new UserMissionSeeder(this.dataSource),
      new ContentValidationSeeder(this.dataSource),
      new NotificationSeeder(this.dataSource),
      new TagSeeder(this.dataSource),
      new WebhookSubscriptionSeeder(this.dataSource),
      // Seeders que dependen de User y Reward
      new UserRewardSeeder(this.dataSource), // UserRewardSeeder después de RewardSeeder
    ];

    for (const seeder of orderedSeeders) {
      console.log(`Attempting to run seeder: ${seeder.constructor.name}`); // Added log
      try {
        await seeder.run();
        console.log(`Successfully finished seeder: ${seeder.constructor.name}`); // Modified log
      } catch (error) {
        console.error(`Error running seeder ${seeder.constructor.name}:`, error); // Added error logging
        throw error; // Re-throw the error to stop execution if a seeder fails
      }
    }
    console.log('Database seeding complete.');

    // Cerrar el DataSource después de ejecutar los seeders
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }
}
