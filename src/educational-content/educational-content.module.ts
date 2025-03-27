import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EducationalContentController } from './educational-content.controller';
import { EducationalContentService } from './educational-content.service';
import { EducationalContent } from './entities/content.entity';

@Module({
    imports: [TypeOrmModule.forFeature([EducationalContent])],
    controllers: [EducationalContentController],
    providers: [EducationalContentService],
    exports: [EducationalContentService],
})
export class EducationalContentModule { } 