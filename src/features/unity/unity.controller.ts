import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUnityDto } from './dto/create-unity.dto';
import { UpdateUnityDto } from './dto/update-unity.dto';
import { UnityService } from './unity.service';

@ApiTags('Unidades')
@Controller('unity')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UnityController {
  constructor(private readonly unityService: UnityService) { }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva unidad de aprendizaje' })
  @ApiResponse({
    status: 201,
    description: 'La unidad ha sido creada exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Los datos proporcionados son inválidos.',
  })
  create(@Body() createUnityDto: CreateUnityDto) {
    return this.unityService.create(createUnityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las unidades de aprendizaje' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las unidades disponibles.',
  })
  findAll() {
    return this.unityService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una unidad de aprendizaje por ID' })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la unidad',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'La unidad ha sido encontrada.',
  })
  @ApiResponse({
    status: 404,
    description: 'La unidad no fue encontrada.',
  })
  findOne(@Param('id') id: string) {
    return this.unityService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar una unidad de aprendizaje' })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la unidad a actualizar',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'La unidad ha sido actualizada exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'La unidad no fue encontrada.',
  })
  @ApiResponse({
    status: 400,
    description: 'Los datos proporcionados son inválidos.',
  })
  update(@Param('id') id: string, @Body() updateUnityDto: UpdateUnityDto) {
    return this.unityService.update(id, updateUnityDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Desactivar una unidad de aprendizaje' })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la unidad a desactivar',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'La unidad ha sido marcada como inactiva exitosamente.',
  })
  @ApiResponse({
    status: 404,
    description: 'La unidad no fue encontrada.',
  })
  remove(@Param('id') id: string) {
    return this.unityService.remove(id);
  }

  @Patch(':id/toggle-lock')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Alternar el estado de bloqueo de una unidad' })
  @ApiResponse({
    status: 200,
    description: 'El estado de bloqueo ha sido actualizado exitosamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Se requiere autenticación.',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Se requiere rol de administrador.',
  })
  @ApiResponse({
    status: 404,
    description: 'La unidad no fue encontrada.',
  })
  toggleLock(@Param('id') id: string) {
    return this.unityService.toggleLock(id);
  }

  @Patch(':id/points')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar los puntos requeridos de una unidad' })
  @ApiResponse({
    status: 200,
    description: 'Los puntos han sido actualizados exitosamente.',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Se requiere autenticación.',
  })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Se requiere rol de administrador.',
  })
  @ApiResponse({
    status: 404,
    description: 'La unidad no fue encontrada.',
  })
  updatePoints(@Param('id') id: string, @Body('points') points: number) {
    return this.unityService.updatePoints(id, points);
  }
} 