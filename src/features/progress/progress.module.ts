import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Progress } from './entities/progress.entity';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { UserModuleProgress } from './entities/user-module-progress.entity';
import { UserModuleProgressController } from './user-module-progress.controller';
import { UserModuleProgressService } from './user-module-progress.service';
import { User } from '../../auth/entities/user.entity';
import { Module as CourseModule } from '../module/entities/module.entity'; // Renombrar para evitar conflicto
import { Exercise } from '../exercises/entities/exercise.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Progress, UserModuleProgress, User, CourseModule, Exercise]),
    ],
    controllers: [ProgressController, UserModuleProgressController],
    providers: [ProgressService, UserModuleProgressService],
    exports: [ProgressService, UserModuleProgressService],
})
export class ProgressModule { }
