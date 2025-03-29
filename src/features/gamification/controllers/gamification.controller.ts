import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { AchievementService } from '../services/achievement.service';
import { EvaluationRewardService } from '../services/evaluation-reward.service';
import { GamificationService } from '../services/gamification.service';
import { MissionService } from '../services/mission.service';

@ApiTags('gamification')
@Controller('api/v1/gamification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GamificationController {
    constructor(
        private readonly missionService: MissionService,
        private readonly achievementService: AchievementService,
        private readonly evaluationRewardService: EvaluationRewardService,
        private readonly gamificationService: GamificationService
    ) { }

    @Get('stats/:userId')
    @ApiOperation({
        summary: 'Obtener estadísticas',
        description: 'Obtiene las estadísticas de gamificación de un usuario específico'
    })
    @ApiParam({
        name: 'userId',
        description: 'Identificador único del usuario',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Estadísticas obtenidas exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Usuario no encontrado'
    })
    async getUserStats(@Param('userId') userId: string) {
        return this.gamificationService.getUserStats(userId);
    }

    @Post('points/:userId')
    @ApiOperation({
        summary: 'Actualizar puntos',
        description: 'Actualiza los puntos de gamificación de un usuario'
    })
    @ApiParam({
        name: 'userId',
        description: 'Identificador único del usuario',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Puntos actualizados exitosamente'
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
        description: 'Usuario no encontrado'
    })
    async updateUserPoints(
        @Param('userId') userId: string,
        @Body('points') points: number
    ) {
        return this.gamificationService.updateUserPoints(userId, points);
    }

    @Post('level/:userId')
    @ApiOperation({
        summary: 'Actualizar nivel',
        description: 'Actualiza el nivel de gamificación de un usuario'
    })
    @ApiParam({
        name: 'userId',
        description: 'Identificador único del usuario',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Nivel actualizado exitosamente'
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
        description: 'Usuario no encontrado'
    })
    async updateUserLevel(
        @Param('userId') userId: string,
        @Body('level') level: number
    ) {
        return this.gamificationService.updateUserLevel(userId, level);
    }

    @Post('achievement/:userId/:achievementId')
    @ApiOperation({
        summary: 'Otorgar logro',
        description: 'Otorga un logro específico a un usuario'
    })
    @ApiParam({
        name: 'userId',
        description: 'Identificador único del usuario',
        type: 'string'
    })
    @ApiParam({
        name: 'achievementId',
        description: 'Identificador único del logro',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Logro otorgado exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Usuario o logro no encontrado'
    })
    async awardAchievement(
        @Param('userId') userId: string,
        @Param('achievementId') achievementId: string
    ) {
        return this.gamificationService.awardAchievement(userId, achievementId);
    }

    @Post('reward/:userId/:rewardId')
    @ApiOperation({
        summary: 'Otorgar recompensa',
        description: 'Otorga una recompensa específica a un usuario'
    })
    @ApiParam({
        name: 'userId',
        description: 'Identificador único del usuario',
        type: 'string'
    })
    @ApiParam({
        name: 'rewardId',
        description: 'Identificador único de la recompensa',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Recompensa otorgada exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Usuario o recompensa no encontrado'
    })
    async awardReward(
        @Param('userId') userId: string,
        @Param('rewardId') rewardId: string
    ) {
        return this.gamificationService.awardReward(userId, rewardId);
    }
} 