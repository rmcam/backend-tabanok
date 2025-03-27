import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { Activity, ActivityType, DifficultyLevel } from './entities/activity.entity';

@ApiTags('Actividades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva actividad' })
  @ApiResponse({ status: 201, description: 'Actividad creada exitosamente' })
  create(@Body() createActivityDto: CreateActivityDto): Promise<Activity> {
    return this.activitiesService.create(createActivityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las actividades' })
  @ApiResponse({ status: 200, description: 'Lista de actividades' })
  findAll(): Promise<Activity[]> {
    return this.activitiesService.findAll();
  }

  @Get('random')
  @ApiOperation({ summary: 'Obtener una actividad aleatoria' })
  @ApiResponse({ status: 200, description: 'Actividad aleatoria' })
  getRandomActivity(): Promise<Activity> {
    return this.activitiesService.getRandomActivity();
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Obtener actividades por tipo' })
  @ApiResponse({ status: 200, description: 'Lista de actividades del tipo especificado' })
  findByType(@Param('type') type: ActivityType): Promise<Activity[]> {
    return this.activitiesService.findByType(type);
  }

  @Get('difficulty/:level')
  @ApiOperation({ summary: 'Obtener actividades por nivel de dificultad' })
  @ApiResponse({ status: 200, description: 'Lista de actividades del nivel especificado' })
  findByDifficulty(@Param('level') level: DifficultyLevel): Promise<Activity[]> {
    return this.activitiesService.findByDifficulty(level);
  }

  @Get('topic/:topicId')
  @ApiOperation({ summary: 'Obtener actividades por tema' })
  @ApiResponse({ status: 200, description: 'Lista de actividades del tema especificado' })
  findByTopic(@Param('topicId') topicId: string): Promise<Activity[]> {
    return this.activitiesService.findByTopic(topicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una actividad por ID' })
  @ApiResponse({ status: 200, description: 'Actividad encontrada' })
  findOne(@Param('id') id: string): Promise<Activity> {
    return this.activitiesService.findOne(id);
  }

  @Post(':id/validate-answer')
  @ApiOperation({ summary: 'Validar respuesta de una actividad' })
  @ApiResponse({ status: 200, description: 'Resultado de la validación' })
  validateAnswer(
    @Param('id') id: string,
    @Body() answer: any,
  ): Promise<{ correct: boolean; points: number }> {
    return this.activitiesService.validateAnswer(id, answer);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una actividad' })
  @ApiResponse({ status: 200, description: 'Actividad actualizada exitosamente' })
  update(
    @Param('id') id: string,
    @Body() updateActivityDto: Partial<CreateActivityDto>,
  ): Promise<Activity> {
    return this.activitiesService.update(id, updateActivityDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una actividad' })
  @ApiResponse({ status: 200, description: 'Actividad eliminada exitosamente' })
  remove(@Param('id') id: string): Promise<void> {
    return this.activitiesService.remove(id);
  }
} 