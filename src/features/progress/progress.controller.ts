import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Obtener progreso por usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Progreso del usuario', type: [Progress] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findByUser(@Param('userId') userId: string, @Query() paginationDto: PaginationDto) {
    return this.progressService.findByUser(userId, paginationDto);
  }

  @Get('user/:userId/module/:moduleId/exercises')
  @ApiOperation({ summary: 'Obtener progreso de ejercicios por usuario y módulo' })
  @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
  @ApiParam({ name: 'moduleId', description: 'ID del módulo (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Progreso de ejercicios del usuario en el módulo', type: [Progress] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario o módulo no encontrado o sin progreso de ejercicios' })
  findExerciseProgressByUserAndModule(@Param('userId') userId: string, @Param('moduleId') moduleId: string, @Query() paginationDto: PaginationDto) {
    return this.progressService.findExerciseProgressByUserAndModule(userId, moduleId, paginationDto);
  }

  @Get('user/:userId/lesson/:lessonId/exercises')
  @ApiOperation({ summary: 'Obtener progreso de ejercicios por usuario y lección' })
  @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
  @ApiParam({ name: 'lessonId', description: 'ID de la lección (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Progreso de ejercicios del usuario en la lección', type: [Progress] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario o lección no encontrada o sin progreso de ejercicios' })
  findExerciseProgressByUserAndLesson(@Param('userId') userId: string, @Param('lessonId') lessonId: string, @Query() paginationDto: PaginationDto) {
    return this.progressService.findExerciseProgressByUserAndLesson(userId, lessonId, paginationDto);
  }

  @Get('user/:userId/unity/:unityId/exercises')
  @ApiOperation({ summary: 'Obtener progreso de ejercicios por usuario y unidad' })
  @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
  @ApiParam({ name: 'unityId', description: 'ID de la unidad (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Progreso de ejercicios del usuario en la unidad', type: [Progress] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario o unidad no encontrada o sin progreso de ejercicios' })
  findExerciseProgressByUserAndUnity(@Param('userId') userId: string, @Param('unityId') unityId: string, @Query() paginationDto: PaginationDto) {
    return this.progressService.findExerciseProgressByUserAndUnity(userId, unityId, paginationDto);
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

  @Get('user/:userId/module/:moduleId')
  @ApiOperation({ summary: 'Obtener el progreso de un módulo específico para un usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
  @ApiParam({ name: 'moduleId', description: 'ID del módulo (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Progreso del módulo del usuario', type: UserModuleProgressDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Progreso de módulo no encontrado' })
  findUserModuleProgress(@Param('userId') userId: string, @Param('moduleId') moduleId: string) {
    return this.progressService.findUserModuleProgress(userId, moduleId);
  }

  @Get('user/:userId/unity/:unityId')
  @ApiOperation({ summary: 'Obtener el progreso de una unidad específica para un usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
  @ApiParam({ name: 'unityId', description: 'ID de la unidad (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Progreso de la unidad del usuario', type: UserUnityProgressDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Progreso de unidad no encontrado' })
  findUserUnityProgress(@Param('userId') userId: string, @Param('unityId') unityId: string) {
    return this.progressService.findUserUnityProgress(userId, unityId);
  }

  @Get('user/:userId/lesson/:lessonId')
  @ApiOperation({ summary: 'Obtener el progreso de una lección específica para un usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
  @ApiParam({ name: 'lessonId', description: 'ID de la lección (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Progreso de la lección del usuario', type: UserLessonProgressDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Progreso de lección no encontrado' })
  findUserLessonProgress(@Param('userId') userId: string, @Param('lessonId') lessonId: string) {
    return this.progressService.findUserLessonProgress(userId, lessonId);
  }

  @Get('user/:userId/exercise/:exerciseId')
  @ApiOperation({ summary: 'Obtener el progreso de un ejercicio específico para un usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
  @ApiParam({ name: 'exerciseId', description: 'ID del ejercicio (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Progreso del ejercicio del usuario', type: ProgressDto })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Progreso de ejercicio no encontrado' })
  findUserExerciseProgress(@Param('userId') userId: string, @Param('exerciseId') exerciseId: string) {
    return this.progressService.findUserExerciseProgress(userId, exerciseId);
  }

  @Get('user/:userId/modules')
  @ApiOperation({ summary: 'Obtener el progreso de todos los módulos para un usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Progreso de todos los módulos del usuario', type: [UserModuleProgressDto] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Progreso de módulos no encontrado' })
  findAllUserModulesProgress(@Param('userId') userId: string, @Query() paginationDto: PaginationDto) {
    return this.progressService.findAllUserModulesProgress(userId, paginationDto);
  }
}
