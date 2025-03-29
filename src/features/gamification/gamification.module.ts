import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../features/user/entities/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { Reward } from '../reward/entities/reward.entity';

// Controladores
import { GamificationController } from '@/features/gamification/controllers/gamification.controller';
import { CulturalAchievementController } from './controllers/cultural-achievement.controller';
import { MentorController } from './controllers/mentor.controller';
import { RewardController } from './controllers/reward.controller';

// Entidades
import { AchievementProgress } from './entities/achievement-progress.entity';
import { Achievement } from './entities/achievement.entity';
import { Badge } from './entities/badge.entity';
import { CulturalAchievement } from './entities/cultural-achievement.entity';
import { Gamification } from './entities/gamification.entity';
import { MentorSpecialization } from './entities/mentor-specialization.entity';
import { Mentor } from './entities/mentor.entity';
import { MentorshipRelation } from './entities/mentorship-relation.entity';
import { Mission } from './entities/mission.entity';
import { UserAchievement } from './entities/user-achievement.entity';
import { UserLevel } from './entities/user-level.entity';
import { UserReward } from './entities/user-reward.entity';

// Servicios
import { AchievementService } from './services/achievement.service';
import { CulturalAchievementService } from './services/cultural-achievement.service';
import { CulturalRewardService } from './services/cultural-reward.service';
import { EvaluationRewardService } from './services/evaluation-reward.service';
import { GamificationService } from './services/gamification.service';
import { MentorService } from './services/mentor.service';
import { MissionService } from './services/mission.service';
import { RewardService } from './services/reward.service';
import { UserLevelService } from './services/user-level.service';

const ENTITIES = [
    User,
    CulturalAchievement,
    Achievement,
    Badge,
    AchievementProgress,
    Mentor,
    MentorSpecialization,
    MentorshipRelation,
    Reward,
    UserLevel,
    UserReward,
    UserAchievement,
    Gamification,
    Mission
];

const CONTROLLERS = [
    GamificationController,
    CulturalAchievementController,
    MentorController,
    RewardController
];

const SERVICES = [
    GamificationService,
    CulturalAchievementService,
    MentorService,
    RewardService,
    UserLevelService,
    CulturalRewardService,
    EvaluationRewardService,
    AchievementService,
    MissionService
];

@Module({
    imports: [
        TypeOrmModule.forFeature(ENTITIES),
        NotificationsModule
    ],
    controllers: CONTROLLERS,
    providers: SERVICES,
    exports: SERVICES
})
export class GamificationModule { } 