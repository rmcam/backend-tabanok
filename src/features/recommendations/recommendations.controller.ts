import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';
import { RecommendationDto } from './dto/recommendation.dto'; // Importar el nuevo DTO

@ApiTags('recomendaciones')
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecommendationsController {
    constructor(private readonly recommendationsService: RecommendationsService) { }

    @Get(':userId')
    @ApiOperation({ summary: 'Obtener recomendaciones personalizadas para un usuario' })
    @ApiParam({ name: 'userId', description: 'ID del usuario para obtener recomendaciones (UUID)', type: String })
    @ApiResponse({
        status: 200,
        description: 'Lista de recomendaciones personalizadas',
        type: [RecommendationDto] // Usar el DTO específico
    })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async getRecommendations(@Param('userId') userId: string): Promise<RecommendationDto[]> {
        // Asumiendo que generateRecommendations devuelve un array de objetos que coinciden con RecommendationDto
        return this.recommendationsService.generateRecommendations(userId) as Promise<RecommendationDto[]>;
    }
}
