import { Module } from '@nestjs/common';
import { SeedCommand } from './seed';
import { UserSeeder } from './user.seeder';
import { VocabularySeeder } from './vocabulary.seeder';
import { WebhookSubscriptionSeeder } from './webhook-subscription.seeder';
import { AccountSeeder } from './account.seeder';
import { AchievementProgressSeeder } from './achievement-progress.seeder';
import { AchievementSeeder } from './achievement.seeder';
import { ActivitySeeder } from './activity.seeder';
import { BadgeSeeder } from './badge.seeder';
import { BaseAchievementSeeder } from './base-achievement.seeder';
import { CollaborationRewardSeeder } from './collaboration-reward.seeder';
import { CommentSeeder } from './comment.seeder';
import { ContentSeeder } from './content.seeder';
import { CulturalAchievementSeeder } from './cultural-achievement.seeder';
import { GamificationSeeder } from './gamification.seeder';
import { LeaderboardSeeder } from './leaderboard.seeder';
import { LessonSeeder } from './lesson.seeder';
import { MentorSpecializationSeeder } from './mentor-specialization.seeder';
import { MentorSeeder } from './mentor.seeder';
import { MultimediaSeeder } from './multimedia.seeder';
import { NotificationSeeder } from './notification.seeder';
import { ProgressSeeder } from './progress.seeder';
import { RevokedTokenSeeder } from './revoked-token.seeder';
import { RewardSeeder } from './reward.seeder';
import { SeasonSeeder } from './season.seeder';
import { SpecialEventSeeder } from './special-event.seeder';
import { TagSeeder } from './statistics-tag.seeder';
import { UserBadgeSeeder } from './user-badge.seeder';
import { UserMissionSeeder } from './user-mission.seeder';
import { UserRewardSeeder } from './user-reward.seeder';
import { ContentVersionSeeder } from './content-version.seeder';
import { ExerciseSeeder } from './exercise.seeder';

@Module({
  imports: [],
  providers: [SeedCommand, UserSeeder, VocabularySeeder, WebhookSubscriptionSeeder, AccountSeeder, AchievementProgressSeeder, AchievementSeeder, ActivitySeeder, BadgeSeeder, BaseAchievementSeeder, CollaborationRewardSeeder, CommentSeeder, ContentSeeder, CulturalAchievementSeeder, GamificationSeeder, LeaderboardSeeder, LessonSeeder, MentorSpecializationSeeder, MentorSeeder, MultimediaSeeder, NotificationSeeder, ProgressSeeder, RevokedTokenSeeder, RewardSeeder, SeasonSeeder, SpecialEventSeeder, TagSeeder, UserBadgeSeeder, UserMissionSeeder, UserRewardSeeder, ContentVersionSeeder, ExerciseSeeder],
  exports: [SeedCommand],
})
export class SeedModule {}
