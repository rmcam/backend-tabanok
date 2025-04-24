import { Body, Controller, Get, Param, ParseIntPipe, Post, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { LeaderboardEntryDto } from '../dto/leaderboard-entry.dto';
import { GamificationService } from '../services/gamification.service';
import { LeaderboardService } from '../services/leaderboard.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@ApiTags('Gamification')
@Controller('gamification')
export class GamificationController {
  constructor(
    private readonly gamificationService: GamificationService,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  /**
   * @description Otorga puntos a un usuario.
   * @param userId ID del usuario.
   * @param points Cantidad de puntos a otorgar.
   * @returns El usuario actualizado.
   */
  @Post('grant-points/:userId')
  @ApiOperation({ summary: 'Otorga puntos a un usuario' })
  @ApiOkResponse({ description: 'El usuario actualizado' })
  @ApiBadRequestResponse({ description: 'Solicitud incorrecta' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiBody({ description: 'Cantidad de puntos a otorgar', schema: { type: 'object', properties: { points: { type: 'number' } } } })
  async grantPoints(@Param('userId', ParseIntPipe) userId: number, @Body('points') points: number) {
    return this.gamificationService.grantPoints(userId, points);
  }

  /**
   * @description Asigna una misión a un usuario.
   * @param userId ID del usuario.
   * @param missionId ID de la misión.
   * @returns El usuario actualizado.
   */
  @Post(':userId/assign-mission/:missionId')
  @ApiOperation({ summary: 'Asigna una misión a un usuario' })
  @ApiOkResponse({ description: 'El usuario actualizado' })
  @ApiBadRequestResponse({ description: 'Solicitud incorrecta' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiParam({ name: 'missionId', description: 'ID de la misión' })
  async assignMission(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('missionId', ParseIntPipe) missionId: number,
  ) {
    return this.gamificationService.assignMission(userId, missionId);
  }

  /**
   * @description Obtiene la tabla de clasificación.
   * @returns Una lista de entradas de la tabla de clasificación.
   * @throws InternalServerErrorException Si ocurre un error al obtener la tabla de clasificación.
   */
  @Get('leaderboard')
  @ApiOperation({ summary: 'Obtiene la tabla de clasificación' })
  @ApiOkResponse({ description: 'Una lista de entradas de la tabla de clasificación' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  async getLeaderboard(): Promise<LeaderboardEntryDto[]> {
    try {
      return await this.leaderboardService.getLeaderboard();
    } catch (error) {
      console.error('Error al obtener la tabla de clasificación:', error);
      throw new InternalServerErrorException('Error al obtener la tabla de clasificación');
    }
  }
}
