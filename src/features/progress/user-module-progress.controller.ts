import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserModuleProgressService } from './user-module-progress.service';
import { CreateUserModuleProgressDto } from './dto/create-user-module-progress.dto';
import { UpdateUserModuleProgressDto } from './dto/update-user-module-progress.dto';
import { UserModuleProgress } from './entities/user-module-progress.entity';

@ApiTags('user-module-progress')
@Controller('user-module-progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserModuleProgressController {
    constructor(private readonly userModuleProgressService: UserModuleProgressService) { }

    @Post()
    @ApiOperation({ summary: 'Crear progreso de módulo de usuario' })
    @ApiBody({ type: CreateUserModuleProgressDto })
    @ApiResponse({ status: 201, description: 'Progreso de módulo de usuario creado exitosamente', type: UserModuleProgress })
    @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    create(@Body() createUserModuleProgressDto: CreateUserModuleProgressDto) {
        return this.userModuleProgressService.create(createUserModuleProgressDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los progresos de módulo de usuario' })
    @ApiResponse({ status: 200, description: 'Lista de progresos de módulo de usuario', type: [UserModuleProgress] })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    findAll() {
        return this.userModuleProgressService.findAll();
    }

    @Get('user/:userId')
    @ApiOperation({ summary: 'Obtener progresos de módulo por usuario' })
    @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
    @ApiResponse({ status: 200, description: 'Progresos de módulo del usuario', type: [UserModuleProgress] })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    findByUser(@Param('userId') userId: string) {
        return this.userModuleProgressService.findByUser(userId);
    }

    @Get('user/:userId/module/:moduleId')
    @ApiOperation({ summary: 'Obtener progreso de módulo específico por usuario y módulo' })
    @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
    @ApiParam({ name: 'moduleId', description: 'ID del módulo (UUID)', type: String })
    @ApiResponse({ status: 200, description: 'Progreso de módulo encontrado', type: UserModuleProgress })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Progreso de módulo no encontrado' })
    findByUserAndModule(@Param('userId') userId: string, @Param('moduleId') moduleId: string) {
        return this.userModuleProgressService.findByUserAndModule(userId, moduleId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener progreso de módulo de usuario por ID' })
    @ApiParam({ name: 'id', description: 'ID del progreso de módulo de usuario (UUID)', type: String })
    @ApiResponse({ status: 200, description: 'Progreso de módulo de usuario encontrado', type: UserModuleProgress })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Progreso de módulo de usuario no encontrado' })
    findOne(@Param('id') id: string) {
        return this.userModuleProgressService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar progreso de módulo de usuario' })
    @ApiParam({ name: 'id', description: 'ID del progreso de módulo de usuario a actualizar (UUID)', type: String })
    @ApiBody({ type: UpdateUserModuleProgressDto })
    @ApiResponse({ status: 200, description: 'Progreso de módulo de usuario actualizado', type: UserModuleProgress })
    @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Progreso de módulo de usuario no encontrado' })
    update(@Param('id') id: string, @Body() updateUserModuleProgressDto: UpdateUserModuleProgressDto) {
        return this.userModuleProgressService.update(id, updateUserModuleProgressDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar progreso de módulo de usuario' })
    @ApiParam({ name: 'id', description: 'ID del progreso de módulo de usuario a eliminar (UUID)', type: String })
    @ApiResponse({ status: 204, description: 'Progreso de módulo de usuario eliminado' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Progreso de módulo de usuario no encontrado' })
    remove(@Param('id') id: string) {
        return this.userModuleProgressService.remove(id);
    }

    @Post('calculate/:userId/:moduleId')
    @ApiOperation({ summary: 'Calcular y actualizar el progreso de un módulo para un usuario' })
    @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
    @ApiParam({ name: 'moduleId', description: 'ID del módulo (UUID)', type: String })
    @ApiResponse({ status: 200, description: 'Progreso del módulo calculado y actualizado', type: UserModuleProgress })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Usuario o módulo no encontrado' })
    calculateModuleProgress(@Param('userId') userId: string, @Param('moduleId') moduleId: string) {
        return this.userModuleProgressService.calculateModuleProgress(userId, moduleId);
    }

    @Get('user/:userId/all-modules')
    @ApiOperation({ summary: 'Calcular y obtener el progreso de todos los módulos para un usuario' })
    @ApiParam({ name: 'userId', description: 'ID del usuario (UUID)', type: String })
    @ApiResponse({ status: 200, description: 'Progreso de todos los módulos del usuario calculado y obtenido', type: [UserModuleProgress] })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    calculateAllModulesProgressForUser(@Param('userId') userId: string) {
        return this.userModuleProgressService.calculateAllModulesProgressForUser(userId);
    }
}
