import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../account/entities/account.entity';
import { User } from '../../auth/entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { StatisticsModule } from '../statistics/statistics.module';
import { UserLevelRepository } from '../gamification/repositories/user-level.repository';
import { UserLevel } from '../gamification/entities/user-level.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Account, UserLevel]), StatisticsModule],
    controllers: [UserController],
    providers: [UserService, UserLevelRepository],
    exports: [UserService],
})
export class UserModule { }
