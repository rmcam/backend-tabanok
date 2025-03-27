import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { Lesson } from './entities/lesson.entity';
import { LessonService } from './lesson.service';

@ApiTags('Lecciones')
@ApiBearerAuth()
@Controller('lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonController {
  constructor(private readonly lessonService: LessonService) { }

  @Post()
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Crear una nueva lección' })
  @ApiResponse({ status: 201, description: 'Lección creada exitosamente', type: Lesson })
  create(@Body() createLessonDto: CreateLessonDto): Promise<Lesson> {
    return this.lessonService.create(createLessonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las lecciones' })
  @ApiResponse({ status: 200, description: 'Lista de lecciones', type: [Lesson] })
  findAll(): Promise<Lesson[]> {
    return this.lessonService.findAll();
  }

  @Get('order/:order')
  @ApiOperation({ summary: 'Obtener lecciones por orden' })
  @ApiParam({ name: 'order', type: 'number', description: 'Orden de la lección' })
  @ApiResponse({ status: 200, description: 'Lecciones encontradas', type: [Lesson] })
  findByOrder(@Param('order', ParseIntPipe) order: number): Promise<Lesson[]> {
    return this.lessonService.findByOrder(order);
  }

  @Get('level/:levelId')
  @ApiOperation({ summary: 'Obtener lecciones por nivel' })
  @ApiParam({ name: 'levelId', type: 'number', description: 'ID del nivel' })
  @ApiResponse({ status: 200, description: 'Lecciones del nivel', type: [Lesson] })
  findByLevel(@Param('levelId', ParseIntPipe) levelId: number): Promise<Lesson[]> {
    return this.lessonService.findByLevel(levelId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una lección por ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la lección' })
  @ApiResponse({ status: 200, description: 'Lección encontrada', type: Lesson })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Lesson> {
    return this.lessonService.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  @ApiOperation({ summary: 'Actualizar una lección' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la lección' })
  @ApiResponse({ status: 200, description: 'Lección actualizada', type: Lesson })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLessonDto: Partial<CreateLessonDto>,
  ): Promise<Lesson> {
    return this.lessonService.update(id, updateLessonDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar una lección' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la lección' })
  @ApiResponse({ status: 200, description: 'Lección eliminada' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.lessonService.remove(id);
  }
}
