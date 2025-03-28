import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Achievement } from './entities/achievement.entity';
import { Mission } from './entities/mission.entity';
import { AchievementService } from './services/achievement.service';
import { EvaluationRewardService } from './services/evaluation-reward.service';
import { MissionService } from './services/mission.service';

@ApiTags('Gamificación')
@Controller('api/v1/gamification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GamificationController {
    constructor(
        private readonly missionService: MissionService,
        private readonly achievementService: AchievementService,
        private readonly evaluationRewardService: EvaluationRewardService
    ) { }

    @Get('missions/active')
    @ApiOperation({ summary: 'Obtener misiones activas del usuario' })
    @ApiResponse({
        status: 200,
        description: 'Lista de misiones activas',
        type: [Mission]
    })
    async getActiveMissions(@Request() req): Promise<Mission[]> {
        return this.missionService.getActiveMissions(req.user.id);
    }

    @Get('achievements')
    @ApiOperation({ summary: 'Obtener logros del usuario' })
    @ApiResponse({
        status: 200,
        description: 'Lista de logros del usuario',
        type: [Achievement]
    })
    async getUserAchievements(@Request() req): Promise<Achievement[]> {
        return this.achievementService.getUserAchievements(req.user.id);
    }

    @Get('achievements/available')
    @ApiOperation({ summary: 'Obtener logros disponibles' })
    @ApiResponse({
        status: 200,
        description: 'Lista de logros disponibles',
        type: [Achievement]
    })
    async getAvailableAchievements(@Request() req): Promise<Achievement[]> {
        return this.achievementService.getAvailableAchievements(req.user.id);
    }

    @Post('evaluation/complete')
    @ApiOperation({ summary: 'Registrar completación de evaluación' })
    @ApiResponse({
        status: 200,
        description: 'Evaluación registrada y recompensas otorgadas'
    })
    async completeEvaluation(
        @Request() req,
        @Body() data: { score: number; totalQuestions: number }
    ): Promise<void> {
        await this.evaluationRewardService.handleEvaluationCompletion(
            req.user.id,
            data.score,
            data.totalQuestions
        );
        await this.achievementService.checkAndAwardAchievements(req.user.id);
    }
} 