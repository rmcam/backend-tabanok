import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { Module } from './entities/module.entity'; // Asumiendo que existe una entidad Module
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Asumiendo que requiere autenticación
import { Unity } from '../unity/entities/unity.entity'; // Importar la entidad Unity

@ApiTags('learning-modules')
@Controller('module')
@UseGuards(JwtAuthGuard) // Asumiendo que requiere autenticación
@ApiBearerAuth() // Añadir ApiBearerAuth
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo módulo de aprendizaje' })
  @ApiBody({ type: CreateModuleDto })
  @ApiResponse({ status: 201, description: 'Módulo creado exitosamente', type: Module })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  create(@Body() createModuleDto: CreateModuleDto) {
    return this.moduleService.create(createModuleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los módulos de aprendizaje' })
  @ApiResponse({ status: 200, description: 'Lista de módulos obtenida exitosamente', type: [Module] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll() {
    return this.moduleService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener módulo por ID' })
  @ApiParam({ name: 'id', description: 'ID del módulo (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Módulo obtenido exitosamente', type: Module })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Módulo no encontrado' })
  findOne(@Param('id') id: string) {
    return this.moduleService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar módulo por ID' })
  @ApiParam({ name: 'id', description: 'ID del módulo a actualizar (UUID)', type: String })
  @ApiBody({ type: UpdateModuleDto })
  @ApiResponse({ status: 200, description: 'Módulo actualizado exitosamente', type: Module })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Módulo no encontrado' })
  update(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto) {
    return this.moduleService.update(id, updateModuleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar módulo por ID' })
  @ApiParam({ name: 'id', description: 'ID del módulo a eliminar (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Módulo eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Módulo no encontrado' })
  remove(@Param('id') id: string) {
    return this.moduleService.remove(id);
  }

  @Get(':id/unities')
  @ApiOperation({ summary: 'Obtener unidades por ID de módulo' })
  @ApiParam({ name: 'id', description: 'ID del módulo (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Lista de unidades obtenida exitosamente', type: [Unity] }) // Usar la entidad Unity
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Módulo no encontrado' })
  findUnitiesByModuleId(@Param('id') id: string) {
    return this.moduleService.findUnitiesByModuleId(id);
  }
}
