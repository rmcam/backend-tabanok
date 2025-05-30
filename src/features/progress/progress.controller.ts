import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Progress } from './entities/progress.entity'; // Importar la entidad Progress
import { UpdateProgressScoreDto } from './dto/update-progress-score.dto'; // Importar DTO de puntaje
import { CompleteExerciseDto } from './dto/complete-exercise.dto'; // Importar DTO de completar ejercicio

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
  findAll() {
    return this.progressService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener progreso por usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Progreso del usuario', type: [Progress] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findByUser(@Param('userId') userId: string) {
    return this.progressService.findByUser(userId);
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

  @Get('exercise/:exerciseId')
  @ApiOperation({ summary: 'Obtener progreso por ejercicio' })
  @ApiParam({ name: 'exerciseId', description: 'ID del ejercicio (UUID)', type: String })
  @ApiResponse({ status: 200, description: 'Progreso del ejercicio', type: [Progress] })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Ejercicio no encontrado' })
  findByExercise(@Param('exerciseId') exerciseId: string) {
    return this.progressService.findByExercise(exerciseId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar progreso' })
  @ApiParam({ name: 'id', description: 'ID del progreso a actualizar (UUID)', type: String })
  @ApiBody({ type: UpdateProgressDto })
  @ApiResponse({ status: 200, description: 'Progreso actualizado', type: Progress })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Progreso no encontrado' })
  update(@Param('id') id: string, @Body() updateProgressDto: UpdateProgressDto) {
    return this.progressService.update(id, updateProgressDto);
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

  @Patch(':id/score')
  @ApiOperation({ summary: 'Actualizar puntaje del progreso' })
  @ApiParam({ name: 'id', description: 'ID del progreso a actualizar (UUID)', type: String })
  @ApiBody({ type: UpdateProgressScoreDto })
  @ApiResponse({ status: 200, description: 'Puntaje actualizado', type: Progress })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Progreso no encontrado' })
  updateScore(@Param('id') id: string, @Body() updateProgressScoreDto: UpdateProgressScoreDto) {
    return this.progressService.updateScore(id, updateProgressScoreDto.score);
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
