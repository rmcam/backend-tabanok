import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ContentValidationService } from './content-validation.service';
import { ContentType } from './interfaces/content-validation.interface';
import { SubmitValidationDto, ValidateContentDto, AddCommunityVoteDto, AddUsageExampleDto, UpdateAudioReferenceDto } from './dto/content-validation.dto';

@ApiTags('validation-content')
@Controller('content-validation')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContentValidationController {
    constructor(private readonly validationService: ContentValidationService) { }

    @Post('submit')
    @ApiOperation({
        summary: 'Enviar contenido para validación',
        description: 'Envía un nuevo contenido al proceso de validación para su revisión'
    })
    @ApiBody({ type: SubmitValidationDto })
    @ApiResponse({
        status: 201,
        description: 'Contenido enviado para validación exitosamente'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    async submitForValidation(@Body() data: SubmitValidationDto) {
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
    @ApiOperation({
        summary: 'Validar contenido',
        description: 'Realiza la validación de un contenido específico por un validador'
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador único del contenido a validar',
        type: 'string'
    })
    @ApiBody({ type: ValidateContentDto })
    @ApiResponse({
        status: 200,
        description: 'Contenido validado exitosamente'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Contenido no encontrado'
    })
    async validateContent(
        @Param('id') id: string,
        @Body() data: ValidateContentDto
    ) {
        return this.validationService.validateContent(
            id,
            data.validatorId,
            data.criteria,
            data.feedback
        );
    }

    @Post(':id/vote')
    @ApiOperation({
        summary: 'Votar contenido',
        description: 'Registra un voto de la comunidad sobre un contenido específico'
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador único del contenido',
        type: 'string'
    })
    @ApiBody({ type: AddCommunityVoteDto })
    @ApiResponse({
        status: 200,
        description: 'Voto registrado exitosamente'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Contenido no encontrado'
    })
    async addCommunityVote(
        @Param('id') id: string,
        @Body() data: AddCommunityVoteDto
    ) {
        return this.validationService.addCommunityVote(
            id,
            data.userId,
            data.isUpvote
        );
    }

    @Post(':id/example')
    @ApiOperation({
        summary: 'Agregar ejemplo de uso',
        description: 'Agrega un ejemplo de uso para un contenido específico'
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador único del contenido',
        type: 'string'
    })
    @ApiBody({ type: AddUsageExampleDto })
    @ApiResponse({
        status: 200,
        description: 'Ejemplo agregado exitosamente'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Contenido no encontrado'
    })
    async addUsageExample(
        @Param('id') id: string,
        @Body() data: AddUsageExampleDto
    ) {
        return this.validationService.addUsageExample(id, data.example);
    }

    @Put(':id/audio')
    @ApiOperation({
        summary: 'Actualizar audio',
        description: 'Actualiza la referencia de audio para un contenido específico'
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador único del contenido',
        type: 'string'
    })
    @ApiBody({ type: UpdateAudioReferenceDto })
    @ApiResponse({
        status: 200,
        description: 'Referencia de audio actualizada exitosamente'
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    async updateAudioReference(
        @Param('id') id: string,
        @Body() data: UpdateAudioReferenceDto
    ) {
        return this.validationService.updateAudioReference(id, data.audioUrl);
    }

    @Get('pending')
    @ApiOperation({
        summary: 'Listar validaciones pendientes',
        description: 'Obtiene la lista de todas las validaciones pendientes en el sistema'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de validaciones pendientes obtenida exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    async findPendingValidations() {
        return this.validationService.findPendingValidations();
    }

    @Get('content/:contentId')
    @ApiOperation({
        summary: 'Obtener validaciones por contenido',
        description: 'Obtiene todas las validaciones asociadas a un contenido específico'
    })
    @ApiParam({
        name: 'contentId',
        description: 'Identificador único del contenido',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de validaciones obtenida exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Contenido no encontrado'
    })
    async findValidationsByContent(@Param('contentId') contentId: string) {
        return this.validationService.findValidationsByContent(contentId);
    }

    @Get('statistics')
    @ApiOperation({
        summary: 'Obtener estadísticas',
        description: 'Obtiene las estadísticas generales del proceso de validación'
    })
    @ApiResponse({
        status: 200,
        description: 'Estadísticas obtenidas exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    async getValidationStatistics() {
        return this.validationService.getValidationStatistics();
    }
}
