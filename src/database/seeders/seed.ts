import { Command, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSourceAwareSeed } from './index';
import { UserSeeder } from './user.seeder'; // Importar seeders individuales aquí
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

@Command({ name: 'seed', description: 'Runs database seeders' })
export class SeedCommand extends CommandRunner {
  private readonly seeders: DataSourceAwareSeed[];

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {
    super();
    // Registrar seeders individuales aquí
    this.seeders = [
      new UserSeeder(this.dataSource),
      new AccountSeeder(this.dataSource),
      new ModuleSeeder(this.dataSource), // Agregar ModuleSeeder
      new UnitySeeder(this.dataSource), // Agregar UnitySeeder
      new LessonSeeder(this.dataSource), // Agregar LessonSeeder
      new TopicSeeder(this.dataSource), // Agregar TopicSeeder
      new ActivitySeeder(this.dataSource), // Agregar ActivitySeeder
      new ContentSeeder(this.dataSource), // Agregar ContentSeeder
      new ContentVersionSeeder(this.dataSource), // Agregar ContentVersionSeeder
      new MultimediaSeeder(this.dataSource), // Agregar MultimediaSeeder
      new StatisticsSeeder(this.dataSource), // Agregar StatisticsSeeder
      new UserLevelSeeder(this.dataSource), // Agregar UserLevelSeeder
      new CommentSeeder(this.dataSource), // Agregar CommentSeeder
      new ExerciseSeeder(this.dataSource),
      new ProgressSeeder(this.dataSource),
      new VocabularySeeder(this.dataSource),
      new RewardSeeder(this.dataSource),
      new AchievementSeeder(this.dataSource),
      new UserAchievementSeeder(this.dataSource), // Agregar UserAchievementSeeder
      new AchievementProgressSeeder(this.dataSource), // Run AchievementProgressSeeder before CulturalAchievementSeeder
      new CulturalAchievementSeeder(this.dataSource),
      new BadgeSeeder(this.dataSource),
      new MissionTemplateSeeder(this.dataSource),
      new SeasonSeeder(this.dataSource),
      new SpecialEventSeeder(this.dataSource),
      new RevokedTokenSeeder(this.dataSource), // Agregar RevokedTokenSeeder
      new CollaborationRewardSeeder(this.dataSource), // Agregar CollaborationRewardSeeder
      new GamificationSeeder(this.dataSource), // Agregar GamificationSeeder
      new LeaderboardSeeder(this.dataSource), // Agregar LeaderboardSeeder
      new MentorSpecializationSeeder(this.dataSource), // Agregar MentorSpecializationSeeder
      new MentorSeeder(this.dataSource), // Agregar MentorSeeder
      new MentorshipRelationSeeder(this.dataSource), // Agregar MentorshipRelationSeeder
      new MissionSeeder(this.dataSource), // Agregar MissionSeeder
      new StreakSeeder(this.dataSource), // Agregar StreakSeeder
      new UserBadgeSeeder(this.dataSource), // Agregar UserBadgeSeeder
      new UserMissionSeeder(this.dataSource), // Agregar UserMissionSeeder
      new UserRewardSeeder(this.dataSource), // Agregar UserRewardSeeder
      new ContentValidationSeeder(this.dataSource), // Agregar ContentValidationSeeder
      new NotificationSeeder(this.dataSource), // Agregar NotificationSeeder
      new TagSeeder(this.dataSource), // Agregar TagSeeder
      new WebhookSubscriptionSeeder(this.dataSource), // Agregar WebhookSubscriptionSeeder
    ];
  }

  async run(): Promise<void> {
    console.log('Running database migrations...');
    await this.dataSource.runMigrations();
    console.log('Database migrations finished.');

    // Explicitly define the execution order of seeders
    
    const orderedSeeders: DataSourceAwareSeed[] = [
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
      new RewardSeeder(this.dataSource),
      new AchievementSeeder(this.dataSource), // AchievementSeeder debe ejecutarse antes que AchievementProgressSeeder
      new UserAchievementSeeder(this.dataSource),
      new CulturalAchievementSeeder(this.dataSource),
      new AchievementProgressSeeder(this.dataSource),
      new BadgeSeeder(this.dataSource),
      new MissionTemplateSeeder(this.dataSource),
      new SeasonSeeder(this.dataSource),
      new SpecialEventSeeder(this.dataSource),
      new RevokedTokenSeeder(this.dataSource),
      new CollaborationRewardSeeder(this.dataSource),
      new GamificationSeeder(this.dataSource),
      new LeaderboardSeeder(this.dataSource),
      new MentorSpecializationSeeder(this.dataSource),
      new MentorSeeder(this.dataSource),
      new MentorshipRelationSeeder(this.dataSource),
      new MissionSeeder(this.dataSource),
      new StreakSeeder(this.dataSource),
      new UserBadgeSeeder(this.dataSource),
      new UserMissionSeeder(this.dataSource),
      new UserRewardSeeder(this.dataSource),
      new ContentValidationSeeder(this.dataSource),
      new NotificationSeeder(this.dataSource),
      new TagSeeder(this.dataSource),
      new WebhookSubscriptionSeeder(this.dataSource),
    ];

    for (const seeder of orderedSeeders) {
      console.log(`Running seeder: ${seeder.constructor.name}`);
      await seeder.run();
      console.log(`Finished seeder: ${seeder.constructor.name}`);
    }
    console.log('Database seeding complete.');
  }
}
