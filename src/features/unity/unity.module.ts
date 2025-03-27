import { Module } from '@nestjs/common';
import { UnityService } from './unity.service';
import { UnityController } from './unity.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unity } from './entities/unity.entity';
import { Lesson } from 'src/features/lesson/entities/lesson.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Unity, Lesson])],
  controllers: [UnityController],
  providers: [UnityService],
})
export class UnityModule {}
