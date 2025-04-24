import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { RecommendationService } from '../services/recommendation.service';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBearerAuth, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('Gamification - Recommendations')
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  /**
   * @description Obtiene recomendaciones para un usuario.
   * @param userId ID del usuario.
   * @returns Una lista de recomendaciones.
   */
  @Get('users/:userId')
  @ApiOperation({ summary: 'Obtiene recomendaciones para un usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Recomendaciones del usuario obtenidas exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiBadRequestResponse({ description: 'Solicitud incorrecta' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  async getRecommendationsByUserId(@Param('userId') userId: string) {
    return this.recommendationService.getRecommendationsByUserId(userId);
  }
}
