import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CulturalContent } from '../cultural-content/cultural-content.entity';
import { EvaluationController } from './evaluation.controller';
import { Evaluation } from './evaluation.entity';
import { EvaluationService } from './evaluation.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([Evaluation, CulturalContent])
    ],
    controllers: [EvaluationController],
    providers: [EvaluationService],
    exports: [EvaluationService]
})
export class EvaluationModule { } 