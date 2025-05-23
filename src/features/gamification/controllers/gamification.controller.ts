import { Body, Controller, Get, Param, Post, InternalServerErrorException, UseGuards } from '@nestjs/common';
import { LeaderboardEntryDto } from '../dto/leaderboard-entry.dto';
import { GamificationService } from '../services/gamification.service';
import { LeaderboardService } from '../services/leaderboard.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBadRequestResponse, ApiInternalServerErrorResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UpdatePointsDto } from '../dto/update-points.dto'; // Importar el DTO de puntos
import { User } from '../../../auth/entities/user.entity'; // Importar la entidad User

@ApiTags('Gamification')
@Controller('gamification')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth() // Añadir ApiBearerAuth a nivel de controlador
export class GamificationController {
  constructor(
    private readonly gamificationService: GamificationService,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  @Post('grant-points/:userId')
  @ApiOperation({ summary: 'Otorga puntos a un usuario' })
  @ApiOkResponse({ description: 'El usuario actualizado', type: User }) // Especificar tipo de respuesta
  @ApiBadRequestResponse({ description: 'Solicitud incorrecta' })
  @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String }) // Cambiar a String
  @ApiBody({ type: UpdatePointsDto, description: 'Cantidad de puntos a otorgar' }) // Usar DTO específico
  async grantPoints(@Param('userId') userId: string, @Body() updatePointsDto: UpdatePointsDto) { // Cambiar tipo de userId y usar DTO
    return this.gamificationService.awardPoints(userId, updatePointsDto.points, 'manual_points', 'Puntos otorgados manualmente');
  }

  @Post(':userId/assign-mission/:missionId')
  @ApiOperation({ summary: 'Asigna una misión a un usuario' })
  @ApiOkResponse({ description: 'El usuario actualizado', type: User }) // Especificar tipo de respuesta
  @ApiBadRequestResponse({ description: 'Solicitud incorrecta' })
  @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String }) // Cambiar a String
  @ApiParam({ name: 'missionId', description: 'ID de la misión (UUID)', type: String }) // Cambiar a String
  async assignMission(
    @Param('userId') userId: string, // Cambiar tipo de userId
    @Param('missionId') missionId: string, // Cambiar tipo de missionId
  ) {
    return this.gamificationService.assignMission(userId, missionId);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Obtiene la tabla de clasificación' })
  @ApiOkResponse({ description: 'Una lista de entradas de la tabla de clasificación', type: [LeaderboardEntryDto] }) // Especificar tipo de respuesta
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
