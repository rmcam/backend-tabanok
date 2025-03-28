import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from './entities/achievement.entity';
import { Badge } from './entities/badge.entity';
import { Gamification } from './entities/gamification.entity';
import { MissionTemplate } from './entities/mission-template.entity';
import { Mission } from './entities/mission.entity';
import { Streak } from './entities/streak.entity';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { DynamicMissionService } from './services/dynamic-mission.service';
import { MissionService } from './services/mission.service';
import { StreakService } from './services/streak.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Gamification,
            Achievement,
            Badge,
            Mission,
            Streak,
            MissionTemplate
        ])
    ],
    controllers: [GamificationController],
    providers: [
        GamificationService,
        MissionService,
        StreakService,
        DynamicMissionService
    ],
    exports: [
        GamificationService,
        MissionService,
        StreakService,
        DynamicMissionService
    ]
})
export class GamificationModule { } 