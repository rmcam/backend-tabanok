import { Module } from '@nestjs/common';
import { SeedCommand } from './seed'; // Importar SeedCommand
import { TypeOrmModule } from '@nestjs/typeorm'; // Importar TypeOrmModule
import { User } from '../../auth/entities/user.entity'; // Importar entidades necesarias para seeders
import { Account } from '../../features/account/entities/account.entity';
import { Module as LearningModule } from '../../features/module/entities/module.entity'; // Renombrar Module para evitar conflicto
import { Unity } from '../../features/unity/entities/unity.entity';
import { Lesson } from '../../features/lesson/entities/lesson.entity';
import { Topic } from '../../features/topic/entities/topic.entity';
import { Activity } from '../../features/activity/entities/activity.entity'; // Importar Activity
import { Content } from '../../features/content/entities/content.entity'; // Importar Content
import { ContentVersion } from '../../features/content-versioning/entities/content-version.entity'; // Importar ContentVersion
import { Comment } from '../../features/comments/entities/comment.entity'; // Importar Comment
import { Exercise } from '../../features/exercises/entities/exercise.entity'; // Importar Exercise
import { Progress } from '../../features/progress/entities/progress.entity'; // Importar Progress
import { Vocabulary } from '../../features/vocabulary/entities/vocabulary.entity'; // Importar Vocabulary
import { Reward } from '../../features/gamification/entities/reward.entity'; // Importar Reward
import { Achievement } from '../../features/gamification/entities/achievement.entity'; // Importar Achievement
import { Badge } from '../../features/gamification/entities/badge.entity'; // Importar Badge
import { MissionTemplate } from '../../features/gamification/entities/mission-template.entity'; // Importar MissionTemplate
import { Season } from '../../features/gamification/entities/season.entity'; // Importar Season
import { SpecialEvent } from '../../features/gamification/entities/special-event.entity'; // Importar SpecialEvent

@Module({
  imports: [
    // Importar TypeOrmModule.forFeature() con las entidades que los seeders necesitan
    TypeOrmModule.forFeature([
      User,
      Account,
      LearningModule,
      Unity,
      Lesson,
      Topic,
      Activity, // Agregar Activity
      Content, // Agregar Content
      ContentVersion, // Agregar ContentVersion
      Comment, // Agregar Comment
      Exercise, // Agregar Exercise
      Progress, // Agregar Progress
      Vocabulary, // Agregar Vocabulary
      Reward, // Agregar Reward
      Achievement, // Agregar Achievement
      Badge, // Agregar Badge
      MissionTemplate, // Agregar MissionTemplate
      Season, // Agregar Season
      SpecialEvent, // Agregar SpecialEvent
      // Agregar otras entidades que necesiten seeders aquí
    ]),
  ],
  providers: [SeedCommand], // Registrar SeedCommand como proveedor
  exports: [SeedCommand], // Exportar SeedCommand si es necesario (aunque CommandFactory lo descubre)
})
export class SeedModule {}
