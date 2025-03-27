import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentVersioningController } from './content-versioning.controller';
import { ContentVersioningService } from './content-versioning.service';
import { ContentVersion } from './entities/content-version.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([ContentVersion])
    ],
    controllers: [ContentVersioningController],
    providers: [ContentVersioningService],
    exports: [ContentVersioningService]
})
export class ContentVersioningModule { } 