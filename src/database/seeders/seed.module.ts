import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../../features/account/entities/account.entity';
import { Content } from '../../features/content/entities/content.entity';
import { Exercise } from '../../features/exercises/entities/exercise.entity';
import { Lesson } from '../../features/lesson/entities/lesson.entity';
import { Progress } from '../../features/progress/entities/progress.entity';
import { Topic } from '../../features/topic/entities/topic.entity';
import { Unity } from '../../features/unity/entities/unity.entity';
import { User } from '../../auth/entities/user.entity';
import { Vocabulary } from '../../features/vocabulary/entities/vocabulary.entity';

// Import seeders
import { UserSeeder } from './user.seeder';
import { GamificationSeeder } from './gamification.seeder';
import { ContentSeeder } from './content.seeder';
import { MiscellaneousSeeder } from './miscellaneous.seeder';
import { LevelSeeder } from './level.seeder'; // Import LevelSeeder

// Import additional entities
import { Activity } from '../../features/activity/entities/activity.entity';
import { ContentVersion } from '../../features/content-versioning/entities/content-version.entity';
import { ContentValidation } from '../../features/content-validation/entities/content-validation.entity';
import { CulturalContent } from '../../features/cultural-content/cultural-content.entity';
import { AchievementProgress } from '../../features/gamification/entities/achievement-progress.entity';
import { Achievement } from '../../features/gamification/entities/achievement.entity';
import { Badge } from '../../features/gamification/entities/badge.entity';
import { BaseAchievement } from '../../features/gamification/entities/base-achievement.entity';
import { CollaborationReward } from '../../features/gamification/entities/collaboration-reward.entity';
import { CulturalAchievement } from '../../features/gamification/entities/cultural-achievement.entity';
import { Gamification } from '../../features/gamification/entities/gamification.entity';
import { Leaderboard } from '../../features/gamification/entities/leaderboard.entity';
import { MentorSpecialization } from '../../features/gamification/entities/mentor-specialization.entity';
import { Mentor } from '../../features/gamification/entities/mentor.entity';
import { MentorshipRelation } from '../../features/gamification/entities/mentorship-relation.entity';
import { MissionTemplate } from '../../features/gamification/entities/mission-template.entity';
import { Mission } from '../../features/gamification/entities/mission.entity';
import { Reward as GamificationReward } from '../../features/gamification/entities/reward.entity'; // Alias to avoid name conflict
import { Season } from '../../features/gamification/entities/season.entity';
import { SpecialEvent } from '../../features/gamification/entities/special-event.entity';
import { Streak } from '../../features/gamification/entities/streak.entity';
import { UserAchievement } from '../../features/gamification/entities/user-achievement.entity';
import { UserBadge } from '../../features/gamification/entities/user-badge.entity';
import { UserLevel } from '../../features/gamification/entities/user-level.entity';
import { UserMission } from '../../features/gamification/entities/user-mission.entity';
import { UserReward } from '../../features/gamification/entities/user-reward.entity';
import { Notification } from '../../features/notifications/entities/notification.entity';
import { Tag } from '../../features/statistics/entities/statistics-tag.entity'; // Remove Tag import
import { Statistics } from '../../features/statistics/entities/statistics.entity';
import { WebhookSubscription } from '../../features/webhooks/entities/webhook-subscription.entity';


import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      Content,
      Exercise,
      Lesson,
      Progress,
      Topic,
      Unity,
      User,
      Vocabulary,
      // Add new entities
      Activity,
      ContentVersion,
      ContentValidation,
      CulturalContent,
      AchievementProgress,
      Achievement,
      Badge,
      BaseAchievement,
      CollaborationReward,
      CulturalAchievement,
      Gamification,
      Leaderboard,
      MentorSpecialization,
      Mentor,
      MentorshipRelation,
      MissionTemplate,
      Mission,
      GamificationReward, // Use gamification Reward
      Season,
      SpecialEvent,
      Streak,
      UserAchievement,
      UserBadge,
      UserLevel,
      UserMission,
      UserReward,
      Notification,
      Tag, // Remove Tag entity
      Statistics,
      WebhookSubscription,
    ]),
  ],
  providers: [
    SeedService,
    UserSeeder,
    GamificationSeeder,
    ContentSeeder,
    MiscellaneousSeeder,
    LevelSeeder, // Add LevelSeeder
  ],
  exports: [SeedService],
})
export class SeedModule { }
