import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserUnityProgressService } from './user-unity-progress.service';
import { CreateUserUnityProgressDto } from './dto/create-user-unity-progress.dto';
import { UpdateUserUnityProgressDto } from './dto/update-user-unity-progress.dto';
import { UserUnityProgress } from './entities/user-unity-progress.entity';

@ApiTags('user-unity-progress')
@Controller('user-unity-progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserUnityProgressController {
    constructor(private readonly userUnityProgressService: UserUnityProgressService) { }

    @Post()
    @ApiOperation({ summary: 'Crear progreso de unidad de usuario' })
    @ApiBody({ type: CreateUserUnityProgressDto })
    @ApiResponse({ status: 201, description: 'Progreso de unidad de usuario creado exitosamente', type: UserUnityProgress })
    @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    create(@Body() createUserUnityProgressDto: CreateUserUnityProgressDto) {
        return this.userUnityProgressService.create(createUserUnityProgressDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los progresos de unidad de usuario' })
    @ApiResponse({ status: 200, description: 'Lista de progresos de unidad de usuario', type: [UserUnityProgress] })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    findAll() {
        return this.userUnityProgressService.findAll();
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Obtener progresos de unidad por usuario' })
    @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
    @ApiResponse({ status: 200, description: 'Progresos de unidad del usuario', type: [UserUnityProgress] })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    findByUser(@Param('userId') userId: string) {
        return this.userUnityProgressService.findByUser(userId);
    }

    @Get('user/:userId/unity/:unityId')
    @ApiOperation({ summary: 'Obtener progreso de unidad específico por usuario y unidad' })
    @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
    @ApiParam({ name: 'unityId', description: 'ID de la unidad (UUID)', type: String })
    @ApiResponse({ status: 200, description: 'Progreso de unidad encontrado', type: UserUnityProgress })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Progreso de unidad no encontrado' })
    findByUserAndUnity(@Param('userId') userId: string, @Param('unityId') unityId: string) {
        return this.userUnityProgressService.findByUserAndUnity(userId, unityId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener progreso de unidad de usuario por ID' })
    @ApiParam({ name: 'id', description: 'ID del progreso de unidad de usuario (UUID)', type: String })
    @ApiResponse({ status: 200, description: 'Progreso de unidad de usuario encontrado', type: UserUnityProgress })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Progreso de unidad de usuario no encontrado' })
    findOne(@Param('id') id: string) {
        return this.userUnityProgressService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar progreso de unidad de usuario' })
    @ApiParam({ name: 'id', description: 'ID del progreso de unidad de usuario a actualizar (UUID)', type: String })
    @ApiBody({ type: UpdateUserUnityProgressDto })
    @ApiResponse({ status: 200, description: 'Progreso de unidad de usuario actualizado', type: UserUnityProgress })
    @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Progreso de unidad de usuario no encontrado' })
    update(@Param('id') id: string, @Body() updateUserUnityProgressDto: UpdateUserUnityProgressDto) {
        return this.userUnityProgressService.update(id, updateUserUnityProgressDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar progreso de unidad de usuario' })
    @ApiParam({ name: 'id', description: 'ID del progreso de unidad de usuario a eliminar (UUID)', type: String })
    @ApiResponse({ status: 204, description: 'Progreso de unidad de usuario eliminado' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Progreso de unidad de usuario no encontrado' })
    remove(@Param('id') id: string) {
        return this.userUnityProgressService.remove(id);
    }

    @Post('calculate/:userId/:unityId')
    @ApiOperation({ summary: 'Calcular y actualizar el progreso de una unidad para un usuario' })
    @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
    @ApiParam({ name: 'unityId', description: 'ID de la unidad (UUID)', type: String })
    @ApiResponse({ status: 200, description: 'Progreso de la unidad calculado y actualizado', type: UserUnityProgress })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Usuario o unidad no encontrado' })
    calculateUnityProgress(@Param('userId') userId: string, @Param('unityId') unityId: string) {
        return this.userUnityProgressService.calculateUnityProgress(userId, unityId);
    }

    @Get('user/:userId/all-unities')
    @ApiOperation({ summary: 'Calcular y obtener el progreso de todas las unidades para un usuario' })
    @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
    @ApiResponse({ status: 200, description: 'Progreso de todas las unidades del usuario calculado y obtenido', type: [UserUnityProgress] })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    calculateAllUnitiesProgressForUser(@Param('userId') userId: string) {
        return this.userUnityProgressService.calculateAllUnitiesProgressForUser(userId);
    }
}
