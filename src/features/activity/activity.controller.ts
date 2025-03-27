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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityType, DifficultyLevel } from './entities/activity.entity';

@ApiTags('Activity')
@Controller('activity')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ActivityController {
  constructor(private readonly activityService: ActivityService) { }

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Crear una nueva actividad' })
  @ApiResponse({
    status: 201,
    description: 'La actividad ha sido creada exitosamente.',
  })
  create(@Body() createActivityDto: CreateActivityDto) {
    return this.activityService.create(createActivityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las actividades' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las actividades activas.',
  })
  findAll() {
    return this.activityService.findAll();
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Obtener actividades por tipo' })
  @ApiResponse({
    status: 200,
    description: 'Lista de actividades filtradas por tipo.',
  })
  findByType(@Param('type') type: ActivityType) {
    return this.activityService.findByType(type);
  }

  @Get('difficulty/:difficulty')
  @ApiOperation({ summary: 'Obtener actividades por dificultad' })
  @ApiResponse({
    status: 200,
    description: 'Lista de actividades filtradas por dificultad.',
  })
  findByDifficulty(@Param('difficulty') difficulty: DifficultyLevel) {
    return this.activityService.findByDifficulty(difficulty);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una actividad por ID' })
  @ApiResponse({
    status: 200,
    description: 'La actividad ha sido encontrada.',
  })
  findOne(@Param('id') id: string) {
    return this.activityService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Actualizar una actividad' })
  @ApiResponse({
    status: 200,
    description: 'La actividad ha sido actualizada exitosamente.',
  })
  update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto) {
    return this.activityService.update(id, updateActivityDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar una actividad' })
  @ApiResponse({
    status: 200,
    description: 'La actividad ha sido eliminada exitosamente.',
  })
  remove(@Param('id') id: string) {
    return this.activityService.remove(id);
  }

  @Patch(':id/points')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Actualizar los puntos de una actividad' })
  @ApiResponse({
    status: 200,
    description: 'Los puntos han sido actualizados exitosamente.',
  })
  updatePoints(@Param('id') id: string, @Body('points') points: number) {
    return this.activityService.updatePoints(id, points);
  }
}
