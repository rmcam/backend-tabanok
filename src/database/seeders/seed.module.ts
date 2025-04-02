import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../../features/account/entities/account.entity';
import { Content } from '../../features/content/entities/content.entity';
import { Exercise } from '../../features/exercises/entities/exercise.entity';
import { Lesson } from '../../features/lesson/entities/lesson.entity';
import { Progress } from '../../features/progress/entities/progress.entity';
import { Reward } from '../../features/reward/entities/reward.entity';
import { Topic } from '../../features/topic/entities/topic.entity';
import { Unity } from '../../features/unity/entities/unity.entity';
import { User } from '../../auth/entities/user.entity'; // Ruta corregida
import { Vocabulary } from '../../features/vocabulary/entities/vocabulary.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Account,
      Content,
      Exercise,
      Lesson,
      Progress,
      Reward,
      Topic,
      Unity,
      User,
      Vocabulary,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule { }
