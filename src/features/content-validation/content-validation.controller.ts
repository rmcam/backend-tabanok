import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ContentValidationService } from './content-validation.service';
import { ContentType } from './interfaces/content-validation.interface';

@ApiTags('validación-contenido')
@Controller('content-validation')
@UseGuards(JwtAuthGuard)
export class ContentValidationController {
    constructor(private readonly validationService: ContentValidationService) { }

    @Post('submit')
    @ApiOperation({ summary: 'Enviar contenido para validación' })
    @ApiResponse({ status: 201, description: 'Contenido enviado exitosamente para validación' })
    async submitForValidation(@Body() data: {
        contentId: string;
        contentType: ContentType;
        originalContent: string;
        translatedContent: string;
        submittedBy: string;
        culturalContext?: string;
        dialectVariation?: string;
    }) {
        return this.validationService.submitForValidation(
            data.contentId,
            data.contentType,
            data.originalContent,
            data.translatedContent,
            data.submittedBy,
            data.culturalContext,
            data.dialectVariation
        );
    }

    @Post(':id/validate')
    @ApiOperation({ summary: 'Validar contenido' })
    @ApiResponse({ status: 200, description: 'Contenido validado exitosamente' })
    async validateContent(
        @Param('id') id: string,
        @Body() data: {
            validatorId: string;
            criteria: {
                spelling: boolean;
                grammar: boolean;
                culturalAccuracy: boolean;
                contextualUse: boolean;
                pronunciation: boolean;
            };
            feedback: {
                criteriaId: string;
                comment: string;
                suggestedCorrection?: string;
            };
        }
    ) {
        return this.validationService.validateContent(
            id,
            data.validatorId,
            data.criteria,
            data.feedback
        );
    }

    @Post(':id/vote')
    @ApiOperation({ summary: 'Votar por un contenido' })
    @ApiResponse({ status: 200, description: 'Voto registrado exitosamente' })
    async addCommunityVote(
        @Param('id') id: string,
        @Body() data: {
            userId: string;
            isUpvote: boolean;
        }
    ) {
        return this.validationService.addCommunityVote(
            id,
            data.userId,
            data.isUpvote
        );
    }

    @Post(':id/example')
    @ApiOperation({ summary: 'Agregar ejemplo de uso' })
    @ApiResponse({ status: 200, description: 'Ejemplo agregado exitosamente' })
    async addUsageExample(
        @Param('id') id: string,
        @Body() data: { example: string }
    ) {
        return this.validationService.addUsageExample(id, data.example);
    }

    @Put(':id/audio')
    @ApiOperation({ summary: 'Actualizar referencia de audio' })
    @ApiResponse({ status: 200, description: 'Referencia de audio actualizada exitosamente' })
    async updateAudioReference(
        @Param('id') id: string,
        @Body() data: { audioUrl: string }
    ) {
        return this.validationService.updateAudioReference(id, data.audioUrl);
    }

    @Get('pending')
    @ApiOperation({ summary: 'Obtener validaciones pendientes' })
    @ApiResponse({ status: 200, description: 'Lista de validaciones pendientes' })
    async findPendingValidations() {
        return this.validationService.findPendingValidations();
    }

    @Get('content/:contentId')
    @ApiOperation({ summary: 'Obtener validaciones por contenido' })
    @ApiResponse({ status: 200, description: 'Lista de validaciones para el contenido' })
    async findValidationsByContent(@Param('contentId') contentId: string) {
        return this.validationService.findValidationsByContent(contentId);
    }

    @Get('statistics')
    @ApiOperation({ summary: 'Obtener estadísticas de validación' })
    @ApiResponse({ status: 200, description: 'Estadísticas de validación' })
    async getValidationStatistics() {
        return this.validationService.getValidationStatistics();
    }
} 