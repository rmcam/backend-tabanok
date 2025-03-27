import { Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentVersion } from '../../content-versioning/entities/content-version.entity';
import { AutoGradingResult } from '../interfaces/auto-grading.interface';
import { AutoGradingService } from '../services/auto-grading.service';

@Controller('auto-grading')
export class AutoGradingController {
    constructor(
        private readonly autoGradingService: AutoGradingService,
        @InjectRepository(ContentVersion)
        private readonly versionRepository: Repository<ContentVersion>
    ) { }

    @Post('grade/:versionId')
    async gradeContent(@Param('versionId') versionId: string): Promise<AutoGradingResult> {
        const version = await this.versionRepository.findOne({
            where: { id: versionId }
        });

        if (!version) {
            throw new NotFoundException(`Versión con ID ${versionId} no encontrada`);
        }

        return this.autoGradingService.gradeContent(version);
    }

    @Get('criteria')
    getCriteria() {
        return {
            weights: this.autoGradingService['WEIGHTS'],
            thresholds: {
                minimum: 0.7,
                good: 0.8,
                excellent: 0.9
            },
            description: {
                completeness: 'Evalúa la presencia y calidad de todos los campos requeridos',
                accuracy: 'Mide la precisión de la traducción y coherencia lingüística',
                culturalRelevance: 'Evalúa la profundidad y relevancia del contexto cultural',
                dialectConsistency: 'Mide la consistencia en el uso del dialecto',
                contextQuality: 'Evalúa la calidad general del contexto y metadata'
            }
        };
    }
} 