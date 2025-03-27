import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reward } from './entities/reward.entity';
import { RewardController } from './reward.controller';
import { RewardService } from './reward.service';

@Module({
    imports: [TypeOrmModule.forFeature([Reward])],
    controllers: [RewardController],
    providers: [RewardService],
    exports: [RewardService],
})
export class RewardModule { } 