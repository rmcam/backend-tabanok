import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CulturalContentController } from './cultural-content.controller';
import { CulturalContent } from './cultural-content.entity';
import { CulturalContentService } from './cultural-content.service';

@Module({
    imports: [TypeOrmModule.forFeature([CulturalContent])],
    providers: [CulturalContentService],
    controllers: [CulturalContentController],
    exports: [CulturalContentService],
})
export class CulturalContentModule { } 