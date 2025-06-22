import { DataSource } from 'typeorm';
import { UserSeeder } from './user.seeder';
import { VocabularySeeder } from './vocabulary.seeder';
import { DataSourceAwareSeed } from './data-source-aware-seed'; // Importar desde el nuevo archivo
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
import { MentorshipRelationSeeder } from './mentorship-relation.seeder';
import { MissionTemplateSeeder } from './mission-template.seeder';
import { MissionSeeder } from './mission.seeder';
import { ModuleSeeder } from './module.seeder';
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

export const seeders = [
  UserSeeder,
  AccountSeeder,
  ModuleSeeder, // Primero: Módulos (no tiene dependencias directas de otros seeders de contenido)
  UnitySeeder, // Segundo: Unidades (depende de Módulos y Usuarios)
  LessonSeeder, // Tercero: Lecciones (depende de Unidades)
  TopicSeeder, // Cuarto: Temas (depende de Lecciones)
  ExerciseSeeder, // Quinto: Ejercicios (depende de Temas)
  VocabularySeeder,
  WebhookSubscriptionSeeder,
  AchievementProgressSeeder,
  AchievementSeeder,
  ActivitySeeder,
  BadgeSeeder,
  BaseAchievementSeeder,
  CollaborationRewardSeeder,
  CommentSeeder,
  ContentSeeder,
  CulturalAchievementSeeder,
  GamificationSeeder,
  LeaderboardSeeder,
  MentorSpecializationSeeder,
  MentorSeeder,
  MentorshipRelationSeeder,
  MissionTemplateSeeder,
  MissionSeeder,
  MultimediaSeeder,
  NotificationSeeder,
  RevokedTokenSeeder,
  RewardSeeder,
  SeasonSeeder,
  SpecialEventSeeder,
  TagSeeder,
  StatisticsSeeder,
  StreakSeeder,
  UserAchievementSeeder,
  UserBadgeSeeder,
  UserLevelSeeder,
  UserMissionSeeder,
  UserRewardSeeder,
  ContentVersionSeeder,
  ProgressSeeder, // Último: Progress (depende de Ejercicios y Usuarios)
];
