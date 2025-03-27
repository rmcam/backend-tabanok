import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from '../lesson/entities/lesson.entity';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { Content } from './entities/content.entity';
import { FileService } from './services/file.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Content, Lesson]),
        ConfigModule,
    ],
    controllers: [ContentController],
    providers: [ContentService, FileService],
    exports: [ContentService]
})
export class ContentModule { } 