import { Public } from '@/auth/decorators/public.decorator';
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../auth/entities/user.entity';
import { MultimediaService } from '../multimedia/multimedia.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { FeaturedLessonDto } from './dto/featured-lesson.dto'; // Importar FeaturedLessonDto
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from './entities/lesson.entity';
import { LessonService } from './lesson.service';

@ApiTags('learning-lessons')
@Controller('lesson')
export class LessonController {
  constructor(
    private readonly lessonService: LessonService,
    private readonly multimediaService: MultimediaService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({
    summary: 'Crear lección',
    description: 'Crea una nueva lección en el sistema',
  })
  @ApiBody({ type: CreateLessonDto })
  @ApiResponse({
    status: 201,
    description: 'Lección creada exitosamente',
    type: Lesson,
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
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonService.create(createLessonDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar lecciones',
    description: 'Obtiene la lista de todas las lecciones disponibles',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de lecciones obtenida exitosamente',
    type: [Lesson],
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  findAll() {
    return this.lessonService.findAll();
  }

  @Public()
  @Get('featured')
  @ApiOperation({
    summary: 'Listar lecciones destacadas',
    description: 'Obtiene la lista de todas las lecciones destacadas disponibles',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de lecciones destacadas obtenida exitosamente',
    type: [FeaturedLessonDto],
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  async findFeatured() {
    const lessons = await this.lessonService.findFeatured(); // La relación multimedia se carga en el servicio
    const featuredLessonsWithImages = lessons.map((lesson) => {
      // Asumiendo que la primera multimedia en la relación es la imagen destacada
      const featuredImage =
        lesson.multimedia && lesson.multimedia.length > 0 ? lesson.multimedia[0] : null;

      return {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        imageSrc: featuredImage ? featuredImage.filePath : null, // Usar filePath como la fuente de la imagen
      };
    });
    return featuredLessonsWithImages;
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener lección',
    description: 'Obtiene una lección específica por su identificador',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la lección',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lección obtenida exitosamente',
    type: Lesson,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Lección no encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.lessonService.findOne(id);
  }

  @Get('unity/:unityId')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener lecciones por unidad',
    description: 'Obtiene todas las lecciones asociadas a una unidad específica',
  })
  @ApiParam({
    name: 'unityId',
    description: 'Identificador único de la unidad',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de lecciones obtenida exitosamente',
    type: [Lesson],
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Unidad no encontrada',
  })
  findByUnity(@Param('unityId') unityId: string) {
    return this.lessonService.findByUnity(unityId);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiOperation({
    summary: 'Actualizar lección',
    description: 'Actualiza una lección existente',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la lección',
    type: 'string',
  })
  @ApiBody({ type: UpdateLessonDto })
  @ApiResponse({
    status: 200,
    description: 'Lección actualizada exitosamente',
    type: Lesson,
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
    description: 'Lección no encontrada',
  })
  update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
    return this.lessonService.update(id, updateLessonDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Eliminar lección',
    description: 'Elimina una lección existente',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la lección',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lección eliminada exitosamente',
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
    description: 'Lección no encontrada',
  })
  remove(@Param('id') id: string) {
    return this.lessonService.remove(id);
  }

  @Patch(':id/toggle-lock')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Alternar bloqueo',
    description: 'Alterna el estado de bloqueo de una lección',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la lección',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado de bloqueo actualizado exitosamente',
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
    description: 'Lección no encontrada',
  })
  toggleLock(@Param('id') id: string) {
    return this.lessonService.toggleLock(id);
  }

  @Patch(':id/points')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Actualizar puntos',
    description: 'Actualiza los puntos requeridos para una lección',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la lección',
    type: 'string',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        points: {
          type: 'number',
          description: 'Puntos requeridos para la lección',
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
    description: 'Lección no encontrada',
  })
  updatePoints(@Param('id') id: string, @Body('points') points: number) {
    return this.lessonService.updatePoints(id, points);
  }

  @Patch(':id/complete')
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN, UserRole.TEACHER)
  @ApiOperation({
    summary: 'Marcar completada',
    description: 'Marca una lección como completada',
  })
  @ApiParam({
    name: 'id',
    description: 'Identificador único de la lección',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Lección marcada como completada exitosamente',
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
    description: 'Lección no encontrada',
  })
  markAsCompleted(@Param('id') id: string) {
    return this.lessonService.markAsCompleted(id);
  }
}
