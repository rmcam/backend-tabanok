import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { LessonService } from './lesson.service';

@ApiTags('Lecciones')
@Controller('lesson')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LessonController {
  constructor(private readonly lessonService: LessonService) { }

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Crear nueva lección' })
  @ApiResponse({ status: 201, description: 'Lección creada exitosamente' })
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonService.create(createLessonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las lecciones' })
  @ApiResponse({ status: 200, description: 'Lista de lecciones' })
  findAll() {
    return this.lessonService.findAll();
  }

  @Get('level/:levelId')
  @ApiOperation({ summary: 'Obtener lecciones por nivel' })
  @ApiResponse({ status: 200, description: 'Lista de lecciones del nivel' })
  findByLevel(@Param('levelId', ParseUUIDPipe) levelId: string) {
    return this.lessonService.findByLevel(levelId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una lección por ID' })
  @ApiResponse({ status: 200, description: 'Lección encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Actualizar una lección' })
  @ApiResponse({ status: 200, description: 'Lección actualizada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonService.update(id, updateLessonDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar una lección' })
  @ApiResponse({ status: 200, description: 'Lección eliminada' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonService.remove(id);
  }

  @Patch(':id/toggle-lock')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Alternar bloqueo de la lección' })
  @ApiResponse({ status: 200, description: 'Estado de bloqueo actualizado' })
  toggleLock(@Param('id', ParseUUIDPipe) id: string) {
    return this.lessonService.toggleLock(id);
  }

  @Patch(':id/points/:points')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Actualizar puntos requeridos' })
  @ApiResponse({ status: 200, description: 'Puntos actualizados' })
  updatePoints(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('points') points: number,
  ) {
    return this.lessonService.updatePoints(id, points);
  }
}
