import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Unity } from './entities/unity.entity';
import { UnityController } from './unity.controller';
import { UnityService } from './unity.service';

@Module({
    imports: [TypeOrmModule.forFeature([Unity])],
    controllers: [UnityController],
    providers: [UnityService],
    exports: [UnityService],
})
export class UnityModule { } 