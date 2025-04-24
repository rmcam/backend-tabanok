import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Recommendation } from './interfaces/recommendation.interface';
import { RecommendationsService } from './recommendations.service';

@ApiTags('recomendaciones')
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RecommendationsController {
    constructor(private readonly recommendationsService: RecommendationsService) { }

    @Get(':userId')
    @ApiOperation({ summary: 'Obtener recomendaciones personalizadas para un usuario' })
    @ApiParam({ name: 'userId', description: 'ID del usuario para obtener recomendaciones' })
    @ApiResponse({
        status: 200,
        description: 'Lista de recomendaciones personalizadas',
        type: [Object]
    })
    async getRecommendations(@Param('userId') userId: string): Promise<Recommendation[]> {
        return this.recommendationsService.generateRecommendations(userId);
    }
}
