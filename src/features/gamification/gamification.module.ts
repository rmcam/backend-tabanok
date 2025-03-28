import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from './entities/achievement.entity';
import { Badge } from './entities/badge.entity';
import { CollaborationReward } from './entities/collaboration-reward.entity';
import { Gamification } from './entities/gamification.entity';
import { Leaderboard } from './entities/leaderboard.entity';
import { Mission } from './entities/mission.entity';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';
import { CollaborationRewardService } from './services/collaboration-reward.service';
import { LeaderboardService } from './services/leaderboard.service';
import { MissionService } from './services/mission.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Gamification,
            Mission,
            Leaderboard,
            CollaborationReward,
            Achievement,
            Badge
        ])
    ],
    providers: [
        GamificationService,
        MissionService,
        LeaderboardService,
        CollaborationRewardService
    ],
    controllers: [GamificationController],
    exports: [
        GamificationService,
        MissionService,
        LeaderboardService,
        CollaborationRewardService
    ]
})
export class GamificationModule { } 