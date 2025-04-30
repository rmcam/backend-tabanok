import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Request, UseGuards } from '@nestjs/common';
import { MissionService } from '../services/mission.service';
import { CreateMissionDto } from '../dto/create-mission.dto';
import { UpdateMissionDto } from '../dto/update-mission.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Mission } from '../entities/mission.entity'; // Import Mission entity for response types

@ApiTags('Gamification - Missions')
@ApiBearerAuth()
@Controller('mission')
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  @Post()
  @ApiOperation({ summary: 'Crea una nueva misión' })
  @ApiBody({ type: CreateMissionDto })
  @ApiResponse({ status: 201, description: 'La misión creada.', type: Mission })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  async create(@Body() createMissionDto: CreateMissionDto): Promise<Mission> {
    return await this.missionService.createMission(createMissionDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obtiene todas las misiones activas para un usuario' })
  @ApiResponse({ status: 200, description: 'Una lista de misiones activas.', type: [Mission] })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findAll(@Request() req): Promise<Mission[]> {
    const userId = req.user.id;
    return await this.missionService.getActiveMissions(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtiene una misión por su ID' })
  @ApiParam({ name: 'id', description: 'ID de la misión (UUID)', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'La misión encontrada.', type: Mission })
  @ApiResponse({ status: 404, description: 'Misión no encontrada o ID inválido.' })
  async findOne(@Param('id') id: string): Promise<Mission> {
    return await this.missionService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualiza una misión existente' })
  @ApiParam({ name: 'id', description: 'ID de la misión a actualizar (UUID)', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateMissionDto })
  @ApiResponse({ status: 200, description: 'La misión actualizada.', type: Mission })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 404, description: 'Misión no encontrada o ID inválido.' })
  async update(@Param('id') id: string, @Body() updateMissionDto: UpdateMissionDto): Promise<Mission> {
    return await this.missionService.update(id, updateMissionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Elimina una misión' })
  @ApiParam({ name: 'id', description: 'ID de la misión a eliminar (UUID)', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Misión eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Misión no encontrada o ID inválido.' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.missionService.remove(id);
  }
}
