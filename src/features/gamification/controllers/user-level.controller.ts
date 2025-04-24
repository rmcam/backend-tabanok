import { Controller, Get, Post, Param, Body, Put } from '@nestjs/common';
import { UserLevelService } from '../services/user-level.service';
import { UserLevel } from '../entities/user-level.entity';
import { UpdateUserLevelDto } from '../dto/update-user-level.dto';
import { ApiTags, ApiOperation, ApiParam, ApiResponse, ApiBody, ApiBearerAuth, ApiBadRequestResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('Gamification - User Levels')
@Controller('levels')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserLevelController {
  constructor(private readonly userLevelService: UserLevelService) {}

  /**
   * @description Obtiene el nivel de un usuario.
   * @param userId ID del usuario.
   * @returns El nivel del usuario.
   */
  @Get(':userId')
  @ApiOperation({ summary: 'Obtiene el nivel de un usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Nivel del usuario obtenido exitosamente', type: UserLevel })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiBadRequestResponse({ description: 'Solicitud incorrecta' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  getUserLevel(@Param('userId', ParseUUIDPipe) userId: string): Promise<UserLevel> {
    return this.userLevelService.getUserLevel(userId);
  }

  /**
   * @description Actualiza el nivel de un usuario.
   * @param userId ID del usuario.
   * @param updateUserLevelDto Datos para actualizar el nivel del usuario.
   * @returns El nivel del usuario actualizado.
   */
  @Put(':userId')
  @ApiOperation({ summary: 'Actualiza el nivel de un usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiBody({ description: 'Datos para actualizar el nivel del usuario', type: UpdateUserLevelDto })
  @ApiResponse({ status: 200, description: 'Nivel del usuario actualizado exitosamente', type: UserLevel })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiBadRequestResponse({ description: 'Solicitud incorrecta' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  updateUserLevel(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() updateUserLevelDto: UpdateUserLevelDto,
  ): Promise<UserLevel> {
    return this.userLevelService.updateUserLevel(userId, updateUserLevelDto);
  }

  /**
   * @description Agrega experiencia a un usuario.
   * @param userId ID del usuario.
   * @param xp Cantidad de experiencia a agregar.
   * @returns El nivel del usuario actualizado.
   */
  @Post(':userId/add-xp')
  @ApiOperation({ summary: 'Agrega experiencia a un usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiBody({ description: 'Cantidad de experiencia a agregar', schema: { type: 'object', properties: { xp: { type: 'number' } } } })
  @ApiResponse({ status: 200, description: 'Experiencia agregada exitosamente', type: UserLevel })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiBadRequestResponse({ description: 'Solicitud incorrecta' })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  addXp(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body('xp') xp: number,
  ): Promise<UserLevel> {
    return this.userLevelService.addExperiencePoints(userId, xp);
  }
}
