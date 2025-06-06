import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, ValidationPipe, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { AppPermission } from '../../../auth/enums/permission.enum'; // Import AppPermission
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
  @Roles(AppPermission.READ_MISSION_TEMPLATES_LIST) // Use permission instead of role
  @ApiOperation({ summary: 'Listar todas las plantillas de misiones (Admin)' })
  @ApiResponse({ status: 200, description: 'Lista de plantillas obtenida exitosamente.', type: [MissionTemplate] })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 403, description: 'Acceso denegado. Rol Admin requerido.' })
  async findAll(): Promise<MissionTemplate[]> {
    return this.missionTemplateService.findAll();
  }

  @Get(':id')
  @Roles(AppPermission.READ_MISSION_TEMPLATE_DETAIL) // Use permission instead of role
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
  @Roles(AppPermission.CREATE_MISSION_TEMPLATE) // Use permission instead of role
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
  @Roles(AppPermission.UPDATE_MISSION_TEMPLATE) // Use permission instead of role
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
    return this.missionTemplateService.update(id, updateDto); // Corrected service call
  }
}
