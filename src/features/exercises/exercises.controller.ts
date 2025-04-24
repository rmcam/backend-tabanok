import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../auth/entities/user.entity'; // Ruta corregida
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { Exercise } from './entities/exercise.entity';
import { ExercisesService } from './exercises.service';

@ApiTags('exercises')
@ApiBearerAuth()
@Controller('exercises')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExercisesController {
    constructor(private readonly exercisesService: ExercisesService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.MODERATOR)
    @ApiOperation({
        summary: 'Crear ejercicio',
        description: 'Crea un nuevo ejercicio en el sistema. Solo administradores y moderadores pueden crear ejercicios.'
    })
    @ApiBody({ type: CreateExerciseDto })
    @ApiResponse({
        status: 201,
        description: 'Ejercicio creado exitosamente',
        type: Exercise
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
        description: 'Forbidden - requiere rol de ADMIN o MODERATOR'
    })
    create(@Body() createExerciseDto: CreateExerciseDto) {
        return this.exercisesService.create(createExerciseDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Listar ejercicios',
        description: 'Obtiene la lista de todos los ejercicios disponibles'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de ejercicios obtenida exitosamente',
        type: [Exercise]
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    findAll() {
        return this.exercisesService.findAll();
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Obtener ejercicio',
        description: 'Obtiene un ejercicio específico por su ID'
    })
    @ApiParam({
        name: 'id',
        description: 'ID del ejercicio',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Ejercicio encontrado exitosamente',
        type: Exercise
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Ejercicio no encontrado'
    })
    findOne(@Param('id') id: string) {
        return this.exercisesService.findOne(id);
    }

    @Put(':id')
    @Roles(UserRole.ADMIN, UserRole.MODERATOR)
    @ApiOperation({
        summary: 'Actualizar ejercicio',
        description: 'Actualiza un ejercicio existente. Solo administradores y moderadores pueden actualizar ejercicios.'
    })
    @ApiParam({
        name: 'id',
        description: 'ID del ejercicio a actualizar',
        type: 'string'
    })
	@ApiBody({ type: UpdateExerciseDto })
    @ApiResponse({
        status: 200,
        description: 'Ejercicio actualizado exitosamente',
        type: Exercise
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
        description: 'Forbidden - requiere rol de ADMIN o MODERATOR'
    })
    @ApiResponse({
        status: 404,
        description: 'Ejercicio no encontrado'
    })
    update(@Param('id') id: string, @Body() updateExerciseDto: UpdateExerciseDto) {
        return this.exercisesService.update(id, updateExerciseDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Eliminar ejercicio',
        description: 'Elimina un ejercicio existente. Solo administradores pueden eliminar ejercicios.'
    })
    @ApiParam({
        name: 'id',
        description: 'ID del ejercicio a eliminar',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Ejercicio eliminado exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 403,
        description: 'Forbidden - requiere rol de ADMIN'
    })
    @ApiResponse({
        status: 404,
        description: 'Ejercicio no encontrado'
    })
    remove(@Param('id') id: string) {
        return this.exercisesService.remove(id);
    }
}

// ... resto del código existente ...
