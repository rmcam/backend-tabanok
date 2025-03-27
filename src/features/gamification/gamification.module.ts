import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from './entities/achievement.entity';
import { Badge } from './entities/badge.entity';
import { Gamification } from './entities/gamification.entity';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Gamification, Achievement, Badge]),
    ],
    controllers: [GamificationController],
    providers: [GamificationService],
    exports: [GamificationService],
})
export class GamificationModule { } 