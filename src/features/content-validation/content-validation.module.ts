import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentValidationController } from './content-validation.controller';
import { ContentValidationService } from './content-validation.service';
import { ContentValidation } from './entities/content-validation.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([ContentValidation])
    ],
    controllers: [ContentValidationController],
    providers: [ContentValidationService],
    exports: [ContentValidationService]
})
export class ContentValidationModule { } 