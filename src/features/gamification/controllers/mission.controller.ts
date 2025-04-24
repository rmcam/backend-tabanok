import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Request, UseGuards } from '@nestjs/common';
import { MissionService } from '../services/mission.service';
import { CreateMissionDto } from '../dto/create-mission.dto';
import { UpdateMissionDto } from '../dto/update-mission.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('mission')
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  /**
   * @description Crea una nueva misión.
   * @param createMissionDto Datos para crear la misión.
   * @returns La misión creada.
   */
  @Post()
  async create(@Body() createMissionDto: CreateMissionDto) {
    return await this.missionService.createMission(createMissionDto);
  }

  /**
   * @description Obtiene todas las misiones activas para un usuario.
   * @param req Objeto de solicitud con la información del usuario.
   * @returns Una lista de misiones activas.
   */
  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(@Request() req) {
    const userId = req.user.id;
    return await this.missionService.getActiveMissions(userId);
  }

  /**
   * @description Obtiene una misión por su ID.
   * @param id ID de la misión.
   * @returns La misión encontrada.
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.missionService.findOne(id);
  }

  /**
   * @description Actualiza una misión existente.
   * @param id ID de la misión a actualizar.
   * @param updateMissionDto Datos para actualizar la misión.
   * @returns La misión actualizada.
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateMissionDto: UpdateMissionDto) {
    return await this.missionService.update(id, updateMissionDto);
  }

  /**
   * @description Elimina una misión.
   * @param id ID de la misión a eliminar.
   * @returns void
   */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.missionService.remove(id);
  }
}
