import { Controller, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentVersion } from '../../content-versioning/entities/content-version.entity';
import { AutoGradingService } from '../services/auto-grading.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { AutoGradingResultDto } from '../dto/auto-grading-result.dto';

@ApiTags('auto-grading')
@Controller('auto-grading')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AutoGradingController {
    constructor(
        private readonly autoGradingService: AutoGradingService,
        @InjectRepository(ContentVersion)
        private readonly versionRepository: Repository<ContentVersion>
    ) { }

    @Post('grade/:versionId')
    @ApiOperation({ summary: 'Calificar contenido por ID de versión' })
    @ApiParam({ name: 'versionId', description: 'ID de la versión del contenido a calificar' })
    @ApiResponse({ status: 200, description: 'Contenido calificado exitosamente', type: AutoGradingResultDto })
    @ApiResponse({ status: 404, description: 'Versión con ID no encontrada' })
    async gradeContent(@Param('versionId') versionId: string): Promise<AutoGradingResultDto> {
        const version = await this.versionRepository.findOne({
            where: { id: versionId }
        });

        if (!version) {
            throw new NotFoundException(`Versión con ID ${versionId} no encontrada`);
        }

        return this.autoGradingService.gradeContent(version);
    }

    @Get('criteria')
    @ApiOperation({ summary: 'Obtener criterios de calificación' })
    @ApiResponse({ status: 200, description: 'Criterios de calificación obtenidos exitosamente' })
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
