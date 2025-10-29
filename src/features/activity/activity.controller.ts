import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AppPermission } from '../../auth/enums/permission.enum'; // Import AppPermission
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { Activity, ActivityType, DifficultyLevel } from './entities/activity.entity';

@ApiTags('learning-activities')
@Controller('activities')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  @Roles(AppPermission.CREATE_ACTIVITY) // Use permission instead of roles
  @ApiOperation({
    summary: 'Crear actividad',
    description: 'Crea una nueva actividad en el sistema',
  })
  @ApiBody({ type: CreateActivityDto })
  @ApiResponse({
    status: 201,
    description: 'Actividad creada exitosamente',
    type: Activity,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos suficientes para realizar esta acción',
  })
  create(@Body() createActivityDto: CreateActivityDto): Promise<Activity> {
    return this.activityService.create(createActivityDto);
  }

  @Get()
  @Roles(AppPermission.READ_ACTIVITIES_LIST)
  @ApiOperation({
    summary: 'Listar actividades',
    description: 'Obtiene la lista de todas las actividades disponibles',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de actividades obtenida exitosamente',
    type: [Activity],
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  findAll(
    @Query('type') type?: ActivityType,
    @Query('difficulty') difficulty?: DifficultyLevel,
  ): Promise<Activity[]> {
    return this.activityService.findAll(type, difficulty);
  }

  @Get(':id')
  @Roles(AppPermission.READ_ACTIVITY_DETAIL)
  @ApiOperation({
    summary: 'Obtener actividad',
    description: 'Obtiene una actividad específica por su identificador',
  })
    @ApiParam({
        name: 'id',
        description: 'Identificador único de la actividad',
        type: 'string',
        format: 'uuid'
    })
  @ApiResponse({
    status: 200,
    description: 'Actividad obtenida exitosamente',
    type: Activity,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Actividad no encontrada',
  })
  findOne(@Param('id') id: string): Promise<Activity> {
    return this.activityService.findOne(id);
  }

  @Patch(':id')
  @Roles(AppPermission.UPDATE_ACTIVITY) // Use permission instead of roles
  @ApiOperation({
    summary: 'Actualizar actividad',
    description: 'Actualiza una actividad existente',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la actividad',
    type: 'string',
  })
  @ApiBody({ type: UpdateActivityDto })
  @ApiResponse({
    status: 200,
    description: 'Actividad actualizada exitosamente',
    type: Activity,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos suficientes para realizar esta acción',
  })
  @ApiResponse({
    status: 404,
    description: 'Actividad no encontrada',
  })
  update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto): Promise<Activity> {
    return this.activityService.update(id, updateActivityDto);
  }

  @Delete(':id')
  @Roles(AppPermission.DELETE_ACTIVITY) // Use permission instead of role
  @ApiOperation({
    summary: 'Eliminar actividad',
    description: 'Elimina una actividad existente',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la actividad',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Actividad eliminada exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos de administrador para realizar esta acción',
  })
  @ApiResponse({
    status: 404,
    description: 'Actividad no encontrada',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.activityService.remove(id);
  }

  @Patch(':id/points')
  @Roles(AppPermission.UPDATE_ACTIVITY_POINTS) // Use permission instead of roles
  @ApiOperation({
    summary: 'Actualizar puntos',
    description: 'Actualiza los puntos de una actividad',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la actividad',
    type: 'string',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        points: {
          type: 'number',
          description: 'Puntos para la actividad',
          example: 100,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Puntos actualizados exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos suficientes para realizar esta acción',
  })
  @ApiResponse({
    status: 404,
    description: 'Actividad no encontrada',
  })
  updatePoints(@Param('id') id: string, @Body('points') points: number) {
    return this.activityService.updatePoints(id, points);
  }
}
