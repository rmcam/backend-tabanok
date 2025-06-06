import { Module, forwardRef } from "@nestjs/common"; // Import forwardRef
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../../auth/auth.module"; // Import AuthModule
import { ActivityController } from "./activity.controller";
import { ActivityService } from "./activity.service";
import { Activity } from "./entities/activity.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity]),
    forwardRef(() => AuthModule), // Use forwardRef for circular dependency
  ],
  controllers: [ActivityController],
  providers: [ActivityService],
  exports: [ActivityService],
})
export class ActivityModule {}
