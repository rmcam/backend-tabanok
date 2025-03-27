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
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { LessonService } from './lesson.service';

@ApiTags('Lesson')
@Controller('lesson')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LessonController {
  constructor(private readonly lessonService: LessonService) { }

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Crear una nueva lección' })
  @ApiResponse({
    status: 201,
    description: 'La lección ha sido creada exitosamente.',
  })
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonService.create(createLessonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las lecciones' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las lecciones activas.',
  })
  findAll() {
    return this.lessonService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una lección por ID' })
  @ApiResponse({
    status: 200,
    description: 'La lección ha sido encontrada.',
  })
  findOne(@Param('id') id: string) {
    return this.lessonService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Actualizar una lección' })
  @ApiResponse({
    status: 200,
    description: 'La lección ha sido actualizada exitosamente.',
  })
  update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
    return this.lessonService.update(id, updateLessonDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar una lección' })
  @ApiResponse({
    status: 200,
    description: 'La lección ha sido eliminada exitosamente.',
  })
  remove(@Param('id') id: string) {
    return this.lessonService.remove(id);
  }

  @Patch(':id/toggle-lock')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Alternar el estado de bloqueo de una lección' })
  @ApiResponse({
    status: 200,
    description: 'El estado de bloqueo ha sido actualizado exitosamente.',
  })
  toggleLock(@Param('id') id: string) {
    return this.lessonService.toggleLock(id);
  }

  @Patch(':id/points')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Actualizar los puntos requeridos de una lección' })
  @ApiResponse({
    status: 200,
    description: 'Los puntos han sido actualizados exitosamente.',
  })
  updatePoints(@Param('id') id: string, @Body('points') points: number) {
    return this.lessonService.updatePoints(id, points);
  }
} 