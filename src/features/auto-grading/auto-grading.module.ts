import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentVersion } from '../content-versioning/entities/content-version.entity';
import { SeedCommand } from './commands/seed.command';
import { AutoGradingController } from './controllers/auto-grading.controller';
import { ContentVersionSeeder } from './seeds/content-version.seed';
import { AutoGradingService } from './services/auto-grading.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([ContentVersion])
    ],
    providers: [
        AutoGradingService,
        ContentVersionSeeder,
        SeedCommand
    ],
    controllers: [AutoGradingController],
    exports: [AutoGradingService, ContentVersionSeeder]
})
export class AutoGradingModule { } 