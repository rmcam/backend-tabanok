import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('progress')
@Controller('progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) { }

  @Post()
  @ApiOperation({ summary: 'Crear progreso' })
  @ApiBody({ type: CreateProgressDto })
  @ApiResponse({ status: 201, description: 'Progreso creado exitosamente' })
  create(@Body() createProgressDto: CreateProgressDto) {
    return this.progressService.create(createProgressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los progresos' })
  @ApiResponse({ status: 200, description: 'Lista de progresos' })
  findAll() {
    return this.progressService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener progreso por ID' })
  @ApiParam({ name: 'id', description: 'ID del progreso' })
  @ApiResponse({ status: 200, description: 'Progreso encontrado' })
  @ApiResponse({ status: 404, description: 'Progreso no encontrado' })
  findOne(@Param('id') id: string) {
    return this.progressService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener progreso por usuario' })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Progreso del usuario' })
  findByUser(@Param('userId') userId: string) {
    return this.progressService.findByUser(userId);
  }

  @Get('exercise/:exerciseId')
  @ApiOperation({ summary: 'Obtener progreso por ejercicio' })
  @ApiParam({ name: 'exerciseId', description: 'ID del ejercicio' })
  @ApiResponse({ status: 200, description: 'Progreso del ejercicio' })
  findByExercise(@Param('exerciseId') exerciseId: string) {
    return this.progressService.findByExercise(exerciseId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar progreso' })
  @ApiParam({ name: 'id', description: 'ID del progreso a actualizar' })
  @ApiBody({ type: UpdateProgressDto })
  @ApiResponse({ status: 200, description: 'Progreso actualizado' })
  @ApiResponse({ status: 404, description: 'Progreso no encontrado' })
  update(@Param('id') id: string, @Body() updateProgressDto: UpdateProgressDto) {
    return this.progressService.update(id, updateProgressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar progreso' })
  @ApiParam({ name: 'id', description: 'ID del progreso a eliminar' })
  @ApiResponse({ status: 204, description: 'Progreso eliminado' })
  @ApiResponse({ status: 404, description: 'Progreso no encontrado' })
  remove(@Param('id') id: string) {
    return this.progressService.remove(id);
  }

  @Patch(':id/score')
  @ApiOperation({ summary: 'Actualizar puntaje del progreso' })
  @ApiParam({ name: 'id', description: 'ID del progreso a actualizar' })
  @ApiBody({ schema: { type: 'object', properties: { score: { type: 'number', description: 'Nuevo puntaje' } } } })
  @ApiResponse({ status: 200, description: 'Puntaje actualizado' })
  @ApiResponse({ status: 404, description: 'Progreso no encontrado' })
  updateScore(@Param('id') id: string, @Body('score') score: number) {
    return this.progressService.updateScore(id, score);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Completar ejercicio del progreso' })
  @ApiParam({ name: 'id', description: 'ID del progreso a actualizar' })
  @ApiBody({ schema: { type: 'object', properties: { answers: { type: 'object', description: 'Respuestas del ejercicio' } } } })
  @ApiResponse({ status: 200, description: 'Ejercicio completado' })
  @ApiResponse({ status: 404, description: 'Progreso no encontrado' })
  completeExercise(@Param('id') id: string, @Body('answers') answers: Record<string, any>) {
    return this.progressService.completeExercise(id, answers);
  }
}
