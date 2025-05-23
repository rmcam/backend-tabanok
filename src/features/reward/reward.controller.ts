import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateRewardDto } from './dto/create-reward.dto';
import { UpdateRewardDto } from './dto/update-reward.dto';
import { RewardType } from './entities/reward.entity';
import { RewardService } from './reward.service';
import { Reward } from './entities/reward.entity'; // Importar la entidad Reward
import { UpdateRewardPointsDto } from './dto/update-reward-points.dto'; // Importar DTO de puntos

@ApiTags('rewards')
@Controller('rewards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RewardController {
  constructor(private readonly rewardService: RewardService) { }

  @Post()
  @ApiOperation({
    summary: 'Crear recompensa',
    description: 'Crea una nueva recompensa en el sistema'
  })
  @ApiBody({ type: CreateRewardDto })
  @ApiResponse({
    status: 201,
    description: 'Recompensa creada exitosamente',
    type: Reward // Especificar tipo de respuesta
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  create(@Body() createRewardDto: CreateRewardDto) {
    return this.rewardService.create(createRewardDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar recompensas',
    description: 'Obtiene todas las recompensas disponibles en el sistema'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de recompensas obtenida exitosamente',
    type: [Reward] // Especificar tipo de respuesta
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  findAll() {
    return this.rewardService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener recompensa',
    description: 'Obtiene los detalles de una recompensa específica por su ID'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la recompensa (UUID)',
    type: String // Especificar tipo como String
  })
  @ApiResponse({
    status: 200,
    description: 'Recompensa encontrada exitosamente',
    type: Reward // Especificar tipo de respuesta
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  @ApiResponse({
    status: 404,
    description: 'Recompensa no encontrada'
  })
  findOne(@Param('id') id: string) {
    return this.rewardService.findOne(id);
  }

  @Get('type/:type')
  @ApiOperation({
    summary: 'Obtener recompensas por tipo',
    description: 'Obtiene todas las recompensas de un tipo específico'
  })
  @ApiParam({
    name: 'type',
    description: 'Tipo de recompensa',
    type: String, // Especificar tipo como String
    enum: RewardType
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de recompensas por tipo obtenida exitosamente',
    type: [Reward] // Especificar tipo de respuesta
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  findByType(@Param('type') type: RewardType) {
    return this.rewardService.findByType(type);
  }

  @Get('user/:userId')
  @ApiOperation({
    summary: 'Obtener recompensas por usuario',
    description: 'Obtiene todas las recompensas asociadas a un usuario específico'
  })
  @ApiParam({
    name: 'userId',
    description: 'Identificador único del usuario (UUID)',
    type: String // Especificar tipo como String
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de recompensas del usuario obtenida exitosamente',
    type: [Reward] // Especificar tipo de respuesta
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado'
  })
  findByUser(@Param('userId') userId: string) {
    return this.rewardService.findByUser(userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar recompensa',
    description: 'Actualiza la información de una recompensa existente'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la recompensa (UUID)',
    type: String // Especificar tipo como String
  })
  @ApiBody({ type: UpdateRewardDto })
  @ApiResponse({
    status: 200,
    description: 'Recompensa actualizada exitosamente',
    type: Reward // Especificar tipo de respuesta
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
    description: 'Recompensa no encontrada'
  })
  update(@Param('id') id: string, @Body() updateRewardDto: UpdateRewardDto) {
    return this.rewardService.update(id, updateRewardDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar recompensa',
    description: 'Elimina una recompensa existente del sistema'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la recompensa (UUID)',
    type: String // Especificar tipo como String
  })
  @ApiResponse({
    status: 200,
    description: 'Recompensa eliminada exitosamente'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  @ApiResponse({
    status: 404,
    description: 'Recompensa no encontrada'
  })
  remove(@Param('id') id: string) {
    return this.rewardService.remove(id);
  }

  @Patch(':id/points')
  @ApiOperation({
    summary: 'Actualizar puntos de recompensa',
    description: 'Modifica los puntos asociados a una recompensa específica'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la recompensa (UUID)',
    type: String // Especificar tipo como String
  })
  @ApiBody({ type: UpdateRewardPointsDto }) // Usar DTO específico
  @ApiResponse({
    status: 200,
    description: 'Puntos de recompensa actualizados exitosamente',
    type: Reward // Especificar tipo de respuesta
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
    description: 'Recompensa no encontrada'
  })
  updatePoints(@Param('id') id: string, @Body() updateRewardPointsDto: UpdateRewardPointsDto) {
    return this.rewardService.updatePoints(id, updateRewardPointsDto.points);
  }

  @Patch(':id/toggle-secret')
  @ApiOperation({
    summary: 'Alternar estado secreto',
    description: 'Cambia el estado secreto de una recompensa entre visible y oculto'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la recompensa (UUID)',
    type: String // Especificar tipo como String
  })
  @ApiResponse({
    status: 200,
    description: 'Estado secreto actualizado exitosamente',
    type: Reward // Especificar tipo de respuesta
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  @ApiResponse({
    status: 404,
    description: 'Recompensa no encontrada'
  })
  toggleSecret(@Param('id') id: string) {
    return this.rewardService.toggleSecret(id);
  }
}
