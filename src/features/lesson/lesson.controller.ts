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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../features/user/entities/user.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from './entities/lesson.entity';
import { LessonService } from './lesson.service';

@ApiTags('learning-lessons')
@Controller('lesson')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LessonController {
  constructor(private readonly lessonService: LessonService) { }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({
    summary: 'Crear lección',
    description: 'Crea una nueva lección en el sistema'
  })
  @ApiBody({ type: CreateLessonDto })
  @ApiResponse({
    status: 201,
    description: 'Lección creada exitosamente',
    type: Lesson
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos suficientes para realizar esta acción'
  })
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonService.create(createLessonDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar lecciones',
    description: 'Obtiene la lista de todas las lecciones disponibles'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de lecciones obtenida exitosamente',
    type: [Lesson]
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  findAll() {
    return this.lessonService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener lección',
    description: 'Obtiene una lección específica por su identificador'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la lección',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Lección obtenida exitosamente',
    type: Lesson
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  @ApiResponse({
    status: 404,
    description: 'Lección no encontrada'
  })
  findOne(@Param('id') id: string) {
    return this.lessonService.findOne(id);
  }

  @Get('unity/:unityId')
  @ApiOperation({
    summary: 'Obtener lecciones por unidad',
    description: 'Obtiene todas las lecciones asociadas a una unidad específica'
  })
  @ApiParam({
    name: 'unityId',
    description: 'Identificador único de la unidad',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de lecciones obtenida exitosamente',
    type: [Lesson]
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  @ApiResponse({
    status: 404,
    description: 'Unidad no encontrada'
  })
  findByUnity(@Param('unityId') unityId: string) {
    return this.lessonService.findByUnity(unityId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({
    summary: 'Actualizar lección',
    description: 'Actualiza una lección existente'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la lección',
    type: 'string'
  })
  @ApiBody({ type: UpdateLessonDto })
  @ApiResponse({
    status: 200,
    description: 'Lección actualizada exitosamente',
    type: Lesson
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos suficientes para realizar esta acción'
  })
  @ApiResponse({
    status: 404,
    description: 'Lección no encontrada'
  })
  update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
    return this.lessonService.update(id, updateLessonDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Eliminar lección',
    description: 'Elimina una lección existente'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la lección',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Lección eliminada exitosamente'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos de administrador para realizar esta acción'
  })
  @ApiResponse({
    status: 404,
    description: 'Lección no encontrada'
  })
  remove(@Param('id') id: string) {
    return this.lessonService.remove(id);
  }

  @Patch(':id/toggle-lock')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Alternar bloqueo',
    description: 'Alterna el estado de bloqueo de una lección'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la lección',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de bloqueo actualizado exitosamente'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos suficientes para realizar esta acción'
  })
  @ApiResponse({
    status: 404,
    description: 'Lección no encontrada'
  })
  toggleLock(@Param('id') id: string) {
    return this.lessonService.toggleLock(id);
  }

  @Patch(':id/points')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Actualizar puntos',
    description: 'Actualiza los puntos requeridos para una lección'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la lección',
    type: 'string'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        points: {
          type: 'number',
          description: 'Puntos requeridos para la lección',
          example: 100
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Puntos actualizados exitosamente'
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos suficientes para realizar esta acción'
  })
  @ApiResponse({
    status: 404,
    description: 'Lección no encontrada'
  })
  updatePoints(@Param('id') id: string, @Body('points') points: number) {
    return this.lessonService.updatePoints(id, points);
  }

  @Patch(':id/complete')
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Marcar completada',
    description: 'Marca una lección como completada'
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la lección',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Lección marcada como completada exitosamente'
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado'
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos suficientes para realizar esta acción'
  })
  @ApiResponse({
    status: 404,
    description: 'Lección no encontrada'
  })
  markAsCompleted(@Param('id') id: string) {
    return this.lessonService.markAsCompleted(id);
  }
} 