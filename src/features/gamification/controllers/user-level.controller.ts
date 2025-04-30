import { Controller, Get, Post, Param, Body, Put, UseGuards, ParseUUIDPipe, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { UserLevelService } from '../services/user-level.service';
import { UserLevel } from '../entities/user-level.entity';
import { UpdateUserLevelDto } from '../dto/update-user-level.dto';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('Gamification - User Levels')
@ApiBearerAuth()
@Controller('levels')
@UseGuards(JwtAuthGuard)
export class UserLevelController {
  constructor(private readonly userLevelService: UserLevelService) {}

  @Get(':userId')
  @ApiOperation({
    summary: 'Obtiene el nivel de un usuario',
    description: 'Recupera la información del nivel actual y puntos de experiencia de un usuario específico.'
  })
  @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Nivel del usuario obtenido exitosamente', type: UserLevel })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getUserLevel(@Param('userId', ParseUUIDPipe) userId: string): Promise<UserLevel> {
    return this.userLevelService.getUserLevel(userId);
  }

  @Put(':userId')
  @ApiOperation({
    summary: 'Actualiza el nivel de un usuario',
    description: 'Actualiza manualmente el nivel y/o los puntos de experiencia de un usuario. Requiere rol de administrador o permisos adecuados.'
  })
  @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: 'string', format: 'uuid' })
  @ApiBody({ description: 'Datos para actualizar el nivel del usuario', type: UpdateUserLevelDto })
  @ApiResponse({ status: 200, description: 'Nivel del usuario actualizado exitosamente', type: UserLevel })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async updateUserLevel(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body(ValidationPipe) updateUserLevelDto: UpdateUserLevelDto,
  ): Promise<UserLevel> {
    return this.userLevelService.updateUserLevel(userId, updateUserLevelDto);
  }

  @Post(':userId/add-xp')
  @ApiOperation({
    summary: 'Agrega experiencia a un usuario',
    description: 'Añade una cantidad específica de puntos de experiencia al total de un usuario.'
  })
  @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: 'string', format: 'uuid' })
  @ApiBody({ description: 'Cantidad de experiencia a agregar', schema: { type: 'object', properties: { xp: { type: 'number', example: 100 } }, required: ['xp'] } })
  @ApiResponse({ status: 200, description: 'Experiencia agregada exitosamente', type: UserLevel })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async addXp(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body('xp', ParseIntPipe) xp: number, // Usar ParseIntPipe para asegurar que xp es un número
  ): Promise<UserLevel> {
    return this.userLevelService.addExperiencePoints(userId, xp);
  }
}
