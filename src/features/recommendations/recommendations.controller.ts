import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Recommendation } from './interfaces/recommendation.interface';
import { RecommendationsService } from './recommendations.service';

@ApiTags('recommendations')
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
    constructor(private readonly recommendationsService: RecommendationsService) { }

    @Get(':userId')
    @ApiOperation({ summary: 'Obtener recomendaciones personalizadas para un usuario' })
    @ApiResponse({
        status: 200,
        description: 'Lista de recomendaciones personalizadas',
        type: [Object]
    })
    async getRecommendations(@Param('userId') userId: string): Promise<Recommendation[]> {
        return this.recommendationsService.generateRecommendations(userId);
    }
} 