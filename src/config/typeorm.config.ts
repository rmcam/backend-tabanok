import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Activity } from '../features/activity/entities/activity.entity';
import { Account } from '../features/account/entities/account.entity';
import { Content } from '../features/content/entities/content.entity';
import { CulturalContent } from '../features/cultural-content/cultural-content.entity';
import { Evaluation } from '../features/evaluation/evaluation.entity';
import { Exercise } from '../features/exercises/entities/exercise.entity';
import { AchievementProgress } from '../features/gamification/entities/achievement-progress.entity';
import { Achievement } from '../features/gamification/entities/achievement.entity';
import { Badge } from '../features/gamification/entities/badge.entity';
import { CulturalAchievement } from '../features/gamification/entities/cultural-achievement.entity';
import { Gamification } from '../features/gamification/entities/gamification.entity';
import { Leaderboard } from '../features/gamification/entities/leaderboard.entity';
import { MentorSpecialization } from '../features/gamification/entities/mentor-specialization.entity';
import { Mentor } from '../features/gamification/entities/mentor.entity';
import { MentorshipRelation } from '../features/gamification/entities/mentorship-relation.entity';
import { Mission } from '../features/gamification/entities/mission.entity';
import { Season } from '../features/gamification/entities/season.entity';
import { SpecialEvent } from '../features/gamification/entities/special-event.entity';
import { UserAchievement } from '../features/gamification/entities/user-achievement.entity';
import { UserLevel } from '../features/gamification/entities/user-level.entity';
import { UserMission } from '../features/gamification/entities/user-mission.entity';
import { UserReward } from '../features/gamification/entities/user-reward.entity';
import { Lesson } from '../features/lesson/entities/lesson.entity';
import { Multimedia } from '../features/multimedia/entities/multimedia.entity';
import { Progress } from '../features/progress/entities/progress.entity';
import { Reward } from '../features/reward/entities/reward.entity';
import { Statistics } from '../features/statistics/entities/statistics.entity';
import { Topic } from '../features/topic/entities/topic.entity';
import { Unity } from '../features/unity/entities/unity.entity';
import { Vocabulary } from '../features/vocabulary/entities/vocabulary.entity';
import { Module } from '../features/module/entities/module.entity'; // Importar la entidad Module
import { ContentVersion } from '../features/content-versioning/entities/content-version.entity'; // Importar la entidad ContentVersion
import { Comment } from '../features/comments/entities/comment.entity'; // Importar la entidad Comment

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    const url = new URL(databaseUrl);
    const password = url.password;

    return {
      type: 'postgres',
      host: url.hostname,
      port: parseInt(url.port, 10),
      username: url.username,
      password: String(password),
      database: url.pathname.slice(1),
      entities: [
        Account,
        Content,
        CulturalContent,
        Exercise,
        Evaluation,
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
        AchievementProgress,
        Mentor,
        MentorSpecialization,
        MentorshipRelation,
        UserLevel,
        Leaderboard,
        Mission,
        Season,
        SpecialEvent,
        Statistics,
        UserMission,
        Activity,
        Multimedia,
        Module, // Añadir la entidad Module
        ContentVersion, // Añadir la entidad ContentVersion
        Comment, // Añadir la entidad Comment
      ],
      synchronize: true, // Habilitar sincronización automática
      logging: true,
      ssl:
        this.configService.get<string>('DB_SSL') === 'true' ? { rejectUnauthorized: false } : false,
    };
  }
}
