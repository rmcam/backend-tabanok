import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../../auth/entities/user.entity";
import { Account } from "../account/entities/account.entity";
import { UserLevelRepository } from "../gamification/repositories/user-level.repository";
import { StatisticsModule } from "../statistics/statistics.module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account]),
    StatisticsModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserLevelRepository],
  exports: [UserService],
})
export class UserModule {}
