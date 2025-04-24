import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, ValidationPipe, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/entities/user.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { MissionTemplateService } from '../services/mission-template.service';
import { MissionTemplate } from '../entities/mission-template.entity';
import { CreateMissionTemplateDto, UpdateMissionTemplateDto } from '../dto/mission-template.dto'; // Import DTOs

@ApiTags('Gamification - Mission Templates') // Mejorar Tag
@ApiBearerAuth()
@Controller('api/v1/mission-templates') // Añadir prefijo API
@UseGuards(JwtAuthGuard, RolesGuard)
export class MissionTemplateController {
  constructor(private readonly missionTemplateService: MissionTemplateService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todas las plantillas de misiones (Admin)' })
  @ApiResponse({ status: 200, description: 'Lista de plantillas obtenida exitosamente.', type: [MissionTemplate] })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Rol Admin requerido.' })
  async findAll(): Promise<MissionTemplate[]> {
    return this.missionTemplateService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Obtener una plantilla de misión por ID (Admin)' })
  @ApiParam({ name: 'id', description: 'ID de la plantilla (UUID)', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Plantilla obtenida exitosamente.', type: MissionTemplate })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Rol Admin requerido.' })
  @ApiResponse({ status: 404, description: 'Plantilla no encontrada o ID inválido.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<MissionTemplate> { // Aplicar ParseUUIDPipe
    return this.missionTemplateService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva plantilla de misión (Admin)' })
  @ApiBody({ type: CreateMissionTemplateDto })
  @ApiResponse({ status: 201, description: 'Plantilla creada exitosamente.', type: MissionTemplate })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Rol Admin requerido.' })
  async create(@Body(ValidationPipe) createDto: CreateMissionTemplateDto): Promise<MissionTemplate> {
    return this.missionTemplateService.create(createDto);
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar una plantilla de misión (Admin)' })
  @ApiParam({ name: 'id', description: 'ID de la plantilla (UUID)', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateMissionTemplateDto })
  @ApiResponse({ status: 200, description: 'Plantilla actualizada exitosamente.', type: MissionTemplate })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Rol Admin requerido.' })
  @ApiResponse({ status: 404, description: 'Plantilla no encontrada o ID inválido.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDto: UpdateMissionTemplateDto,
  ): Promise<MissionTemplate> {
    return this.missionTemplateService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar una plantilla de misión (Admin)' })
  @ApiParam({ name: 'id', description: 'ID de la plantilla (UUID)', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Eliminado exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Rol Admin requerido.' })
  @ApiResponse({ status: 404, description: 'Plantilla no encontrada o ID inválido.' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> { // Aplicar ParseUUIDPipe
    return this.missionTemplateService.remove(id);
  }
}
