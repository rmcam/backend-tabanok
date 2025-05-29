import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { User } from "../auth/entities/user.entity";
import { Account } from "../features/account/entities/account.entity";
import { Activity } from "../features/activity/entities/activity.entity";
import { Comment } from "../features/comments/entities/comment.entity"; // Importar la entidad Comment
import { ContentValidation } from "../features/content-validation/entities/content-validation.entity"; // Importar ContentValidation
import { ContentVersion } from "../features/content-versioning/entities/content-version.entity"; // Importar la entidad ContentVersion
import { Content } from "../features/content/entities/content.entity";
import { CulturalContent } from "../features/cultural-content/cultural-content.entity";
import { Exercise } from "../features/exercises/entities/exercise.entity";
import { AchievementProgress } from "../features/gamification/entities/achievement-progress.entity";
import { Achievement } from "../features/gamification/entities/achievement.entity";
import { Badge } from "../features/gamification/entities/badge.entity";
import { BaseAchievement } from "../features/gamification/entities/base-achievement.entity"; // Importar BaseAchievement
import { CollaborationReward } from "../features/gamification/entities/collaboration-reward.entity"; // Importar CollaborationReward
import { CulturalAchievement } from "../features/gamification/entities/cultural-achievement.entity";
import { Gamification } from "../features/gamification/entities/gamification.entity";
import { Leaderboard } from "../features/gamification/entities/leaderboard.entity";
import { MentorSpecialization } from "../features/gamification/entities/mentor-specialization.entity";
import { Mentor } from "../features/gamification/entities/mentor.entity";
import { MentorshipRelation } from "../features/gamification/entities/mentorship-relation.entity";
import { MissionTemplate } from "../features/gamification/entities/mission-template.entity"; // Importar MissionTemplate
import { Mission } from "../features/gamification/entities/mission.entity";
import { Season } from "../features/gamification/entities/season.entity";
import { SpecialEvent } from "../features/gamification/entities/special-event.entity";
import { Streak } from "../features/gamification/entities/streak.entity"; // Importar Streak
import { UserAchievement } from "../features/gamification/entities/user-achievement.entity";
import { UserBadge } from "../features/gamification/entities/user-badge.entity"; // Importar UserBadge
import { UserMission } from "../features/gamification/entities/user-mission.entity";
import { UserReward } from "../features/gamification/entities/user-reward.entity";
import { Lesson } from "../features/lesson/entities/lesson.entity";
import { Module } from "../features/module/entities/module.entity"; // Importar la entidad Module
import { Multimedia } from "../features/multimedia/entities/multimedia.entity";
import { Notification } from "../features/notifications/entities/notification.entity";
import { Progress } from "../features/progress/entities/progress.entity";
import { Reward } from "../features/reward/entities/reward.entity";
import { Statistics } from "../features/statistics/entities/statistics.entity";
import { Topic } from "../features/topic/entities/topic.entity";
import { Unity } from "../features/unity/entities/unity.entity";
import { UserLevel } from "../features/gamification/entities/user-level.entity"; // Importar UserLevel
import { Vocabulary } from "../features/vocabulary/entities/vocabulary.entity";
import { Tag } from "../features/statistics/entities/statistics-tag.entity";
import { WebhookSubscription } from "../features/webhooks/entities/webhook-subscription.entity";

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const databaseUrl = this.configService.get<string>("DATABASE_URL");
    const url = new URL(databaseUrl);
    const password = url.password;

    return {
      type: "postgres",
      host: url.hostname,
      port: parseInt(url.port, 10),
      username: url.username,
      password: String(password),
      database: url.pathname.slice(1),
      entities: [
        BaseAchievement,
        Account,
        Content,
        CulturalContent,
        MissionTemplate,
        Exercise,
        Lesson,
        Progress,
        Reward,
        Topic,
        Unity,
        User,
        Vocabulary,
        Achievement,
        Badge,
        Gamification,
        UserAchievement,
        UserReward,
        CulturalAchievement,
        CollaborationReward,
        AchievementProgress,
        Mentor,
        UserBadge,
        Notification,
        MentorSpecialization,
        MentorshipRelation,
        Leaderboard,
        Mission,
        Season,
        SpecialEvent,
        Statistics,
        UserMission,
        Streak,
        Activity,
        Multimedia,
        Module,
        ContentVersion,
        Comment,
        ContentValidation,
        Tag,
        WebhookSubscription,
        UserLevel, // Agregar UserLevel
      ],
      synchronize: false,
      logging: true,
      dropSchema: false,
      ssl:
        this.configService.get<string>("DB_SSL") === "true"
          ? { rejectUnauthorized: false }
          : false,
    };
  }
}
