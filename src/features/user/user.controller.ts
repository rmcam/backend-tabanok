import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    @ApiOperation({
        summary: 'Crear nuevo usuario',
        description: 'Crea un nuevo usuario en el sistema con la información proporcionada'
    })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({
        status: 201,
        description: 'Usuario creado exitosamente',
        type: CreateUserDto
    })
    @ApiResponse({
        status: 400,
        description: 'Datos de entrada inválidos'
    })
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Obtener todos los usuarios',
        description: 'Retorna una lista de todos los usuarios registrados en el sistema'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de usuarios obtenida exitosamente',
        type: [CreateUserDto]
    })
    findAll() {
        return this.userService.findAll();
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Obtener usuario por ID',
        description: 'Busca y retorna un usuario específico por su ID'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único del usuario',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Usuario encontrado exitosamente',
        type: CreateUserDto
    })
    @ApiResponse({
        status: 404,
        description: 'Usuario no encontrado'
    })
    findOne(@Param('id') id: string) {
        return this.userService.findOne(id);
    }

    @Get('email/:email')
    @ApiOperation({
        summary: 'Obtener usuario por email',
        description: 'Busca y retorna un usuario específico por su dirección de email'
    })
    @ApiParam({
        name: 'email',
        description: 'Email del usuario',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Usuario encontrado exitosamente',
        type: CreateUserDto
    })
    @ApiResponse({
        status: 404,
        description: 'Usuario no encontrado'
    })
    findByEmail(@Param('email') email: string) {
        return this.userService.findByEmail(email);
    }

    @Patch(':id')
    @ApiOperation({
        summary: 'Actualizar usuario',
        description: 'Actualiza la información de un usuario existente'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único del usuario',
        type: 'string'
    })
    @ApiBody({ type: UpdateUserDto })
    @ApiResponse({
        status: 200,
        description: 'Usuario actualizado exitosamente',
        type: UpdateUserDto
    })
    @ApiResponse({
        status: 404,
        description: 'Usuario no encontrado'
    })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(id, updateUserDto);
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Eliminar usuario',
        description: 'Elimina un usuario del sistema'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único del usuario',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Usuario eliminado exitosamente'
    })
    @ApiResponse({
        status: 404,
        description: 'Usuario no encontrado'
    })
    remove(@Param('id') id: string) {
        return this.userService.remove(id);
    }

    @Patch(':id/points')
    @ApiOperation({
        summary: 'Actualizar puntos del usuario',
        description: 'Actualiza los puntos acumulados de un usuario'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único del usuario',
        type: 'string'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                points: {
                    type: 'number',
                    description: 'Cantidad de puntos a asignar'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Puntos actualizados exitosamente'
    })
    @ApiResponse({
        status: 404,
        description: 'Usuario no encontrado'
    })
    updatePoints(@Param('id') id: string, @Body('points') points: number) {
        return this.userService.updatePoints(id, points);
    }

    @Patch(':id/level')
    @ApiOperation({
        summary: 'Actualizar nivel del usuario',
        description: 'Actualiza el nivel actual del usuario'
    })
    @ApiParam({
        name: 'id',
        description: 'ID único del usuario',
        type: 'string'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                level: {
                    type: 'number',
                    description: 'Nuevo nivel del usuario'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Nivel actualizado exitosamente'
    })
    @ApiResponse({
        status: 404,
        description: 'Usuario no encontrado'
    })
    updateLevel(@Param('id') id: string, @Body('level') level: number) {
        return this.userService.updateLevel(id, level);
    }
} 