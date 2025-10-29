import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateOverallProgressDto } from './dto/update-overall-progress.dto';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Progress } from './entities/progress.entity'; // Importar la entidad Progress
import { UpdateProgressScoreDto } from './dto/update-progress-score.dto'; // Importar DTO de puntaje
import { CompleteExerciseDto } from './dto/complete-exercise.dto'; // Importar DTO de completar ejercicio
import { PaginationDto } from '../../common/dto/pagination.dto'; // Importar PaginationDto
import { UserModuleProgressDto } from './dto/user-module-progress.dto'; // Importar DTO de UserModuleProgress
import { UserUnityProgressDto } from './dto/user-unity-progress.dto'; // Importar DTO de UserUnityProgress
import { UserLessonProgressDto } from './dto/user-lesson-progress.dto'; // Importar DTO de UserLessonProgress
import { ProgressDto } from './dto/progress.dto'; // Importar DTO de Progress
import { GetUserProgressFilterDto } from './dto/get-user-progress-filter.dto'; // Importar DTO de filtro de progreso de usuario

@ApiTags('progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) { }

  @Post()
  @ApiOperation({ summary: 'Crear progreso' })
  @ApiBody({ type: CreateProgressDto })
  @ApiResponse({ status: 201, description: 'Progreso creado exitosamente', type: Progress })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  create(@Body() createProgressDto: CreateProgressDto) {
    return this.progressService.create(createProgressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los progresos' })
  @ApiResponse({ status: 200, description: 'Lista de progresos', type: [Progress] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.progressService.findAll(paginationDto);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener progreso por usuario con filtros' })
  @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
  @ApiQuery({ type: GetUserProgressFilterDto })
  @ApiResponse({ status: 200, description: 'Progreso del usuario', type: [Progress] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findByUser(
    @Param('userId') userId: string,
    @Query() filterDto: GetUserProgressFilterDto,
  ) {
    const { page, limit, moduleId, unityId, lessonId, exerciseId, includeExercises, includeModules } = filterDto;
    return this.progressService.findByUser(userId, {
      paginationDto: { page, limit },
      moduleId,
      unityId,
      lessonId,
      exerciseId,
      includeExercises,
      includeModules,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener progreso por ID' })
  @ApiParam({ name: 'id', description: 'ID del progreso (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Progreso encontrado', type: Progress })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Progreso no encontrado' })
  findOne(@Param('id') id: string) {
    return this.progressService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar progreso' })
  @ApiParam({ name: 'id', description: 'ID del progreso a actualizar (UUID)', type: String })
  @ApiBody({ type: UpdateOverallProgressDto })
  @ApiResponse({ status: 200, description: 'Progreso actualizado', type: Progress })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Progreso no encontrado' })
  update(@Param('id') id: string, @Body() updateOverallProgressDto: UpdateOverallProgressDto) {
    return this.progressService.update(id, updateOverallProgressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar progreso' })
  @ApiParam({ name: 'id', description: 'ID del progreso a eliminar (UUID)', type: String })
  @ApiResponse({ status: 204, description: 'Progreso eliminado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Progreso no encontrado' })
  remove(@Param('id') id: string) {
    return this.progressService.remove(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Completar ejercicio del progreso' })
  @ApiParam({ name: 'id', description: 'ID del progreso a actualizar (UUID)', type: String })
  @ApiBody({ type: CompleteExerciseDto })
  @ApiResponse({ status: 200, description: 'Ejercicio completado', type: Progress })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Progreso no encontrado' })
  completeExercise(@Param('id') id: string, @Body() completeExerciseDto: CompleteExerciseDto) {
    return this.progressService.completeExercise(id, completeExerciseDto.answers);
  }
}
