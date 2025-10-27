import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserLessonProgressService } from './user-lesson-progress.service';
import { CreateUserLessonProgressDto } from './dto/create-user-lesson-progress.dto';
import { UpdateUserLessonProgressDto } from './dto/update-user-lesson-progress.dto';
import { UserLessonProgress } from './entities/user-lesson-progress.entity';

@ApiTags('user-lesson-progress')
@Controller('user-lesson-progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserLessonProgressController {
    constructor(private readonly userLessonProgressService: UserLessonProgressService) { }

    @Post()
    @ApiOperation({ summary: 'Crear progreso de lección de usuario' })
    @ApiBody({ type: CreateUserLessonProgressDto })
    @ApiResponse({ status: 201, description: 'Progreso de lección de usuario creado exitosamente', type: UserLessonProgress })
    @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    create(@Body() createUserLessonProgressDto: CreateUserLessonProgressDto) {
        return this.userLessonProgressService.create(createUserLessonProgressDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los progresos de lección de usuario' })
    @ApiResponse({ status: 200, description: 'Lista de progresos de lección de usuario', type: [UserLessonProgress] })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    findAll() {
        return this.userLessonProgressService.findAll();
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Obtener progresos de lección por usuario' })
    @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
    @ApiResponse({ status: 200, description: 'Progresos de lección del usuario', type: [UserLessonProgress] })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    findByUser(@Param('userId') userId: string) {
        return this.userLessonProgressService.findByUser(userId);
    }

    @Get('user/:userId/lesson/:lessonId')
    @ApiOperation({ summary: 'Obtener progreso de lección específico por usuario y lección' })
    @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
    @ApiParam({ name: 'lessonId', description: 'ID de la lección (UUID)', type: String })
    @ApiResponse({ status: 200, description: 'Progreso de lección encontrado', type: UserLessonProgress })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Progreso de lección no encontrado' })
    findByUserAndLesson(@Param('userId') userId: string, @Param('lessonId') lessonId: string) {
        return this.userLessonProgressService.findByUserAndLesson(userId, lessonId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener progreso de lección de usuario por ID' })
    @ApiParam({ name: 'id', description: 'ID del progreso de lección de usuario (UUID)', type: String })
    @ApiResponse({ status: 200, description: 'Progreso de lección de usuario encontrado', type: UserLessonProgress })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Progreso de lección de usuario no encontrado' })
    findOne(@Param('id') id: string) {
        return this.userLessonProgressService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar progreso de lección de usuario' })
    @ApiParam({ name: 'id', description: 'ID del progreso de lección de usuario a actualizar (UUID)', type: String })
    @ApiBody({ type: UpdateUserLessonProgressDto })
    @ApiResponse({ status: 200, description: 'Progreso de lección de usuario actualizado', type: UserLessonProgress })
    @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Progreso de lección de usuario no encontrado' })
    update(@Param('id') id: string, @Body() updateUserLessonProgressDto: UpdateUserLessonProgressDto) {
        return this.userLessonProgressService.update(id, updateUserLessonProgressDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar progreso de lección de usuario' })
    @ApiParam({ name: 'id', description: 'ID del progreso de lección de usuario a eliminar (UUID)', type: String })
    @ApiResponse({ status: 204, description: 'Progreso de lección de usuario eliminado' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Progreso de lección de usuario no encontrado' })
    remove(@Param('id') id: string) {
        return this.userLessonProgressService.remove(id);
    }

    @Post('calculate/:userId/:lessonId')
    @ApiOperation({ summary: 'Calcular y actualizar el progreso de una lección para un usuario' })
    @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
    @ApiParam({ name: 'lessonId', description: 'ID de la lección (UUID)', type: String })
    @ApiResponse({ status: 200, description: 'Progreso de la lección calculado y actualizado', type: UserLessonProgress })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Usuario o lección no encontrado' })
    calculateLessonProgress(@Param('userId') userId: string, @Param('lessonId') lessonId: string) {
        return this.userLessonProgressService.calculateLessonProgress(userId, lessonId);
    }

    @Get('user/:userId/all-lessons')
    @ApiOperation({ summary: 'Calcular y obtener el progreso de todas las lecciones para un usuario' })
    @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
    @ApiResponse({ status: 200, description: 'Progreso de todas las lecciones del usuario calculado y obtenido', type: [UserLessonProgress] })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    calculateAllLessonsProgressForUser(@Param('userId') userId: string) {
        return this.userLessonProgressService.calculateAllLessonsProgressForUser(userId);
    }
}
