import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseEnumPipe,
    ParseIntPipe,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { Exercise, ExerciseType } from './entities/exercise.entity';
import { ExerciseService } from './exercise.service';

@ApiTags('Ejercicios')
@Controller('exercise')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExerciseController {
    constructor(private readonly exerciseService: ExerciseService) { }

    @Post()
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Crear nuevo ejercicio' })
    @ApiResponse({
        status: 201,
        description: 'Ejercicio creado exitosamente',
        type: Exercise,
    })
    create(@Body() createExerciseDto: CreateExerciseDto) {
        return this.exerciseService.create(createExerciseDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los ejercicios' })
    @ApiResponse({
        status: 200,
        description: 'Lista de ejercicios',
        type: [Exercise],
    })
    findAll() {
        return this.exerciseService.findAll();
    }

    @Get('lesson/:lessonId')
    @ApiOperation({ summary: 'Obtener ejercicios por lección' })
    @ApiParam({
        name: 'lessonId',
        type: 'string',
        format: 'uuid',
        description: 'ID de la lección',
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de ejercicios de la lección',
        type: [Exercise],
    })
    findByLesson(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
        return this.exerciseService.findByLesson(lessonId);
    }

    @Get('type/:type')
    @ApiOperation({ summary: 'Obtener ejercicios por tipo' })
    @ApiParam({
        name: 'type',
        enum: ExerciseType,
        description: 'Tipo de ejercicio',
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de ejercicios del tipo especificado',
        type: [Exercise],
    })
    findByType(
        @Param('type', new ParseEnumPipe(ExerciseType)) type: ExerciseType,
    ) {
        return this.exerciseService.findByType(type);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un ejercicio por ID' })
    @ApiParam({
        name: 'id',
        type: 'string',
        format: 'uuid',
        description: 'ID del ejercicio',
    })
    @ApiResponse({
        status: 200,
        description: 'Ejercicio encontrado',
        type: Exercise,
    })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.exerciseService.findOne(id);
    }

    @Patch(':id')
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Actualizar un ejercicio' })
    @ApiParam({
        name: 'id',
        type: 'string',
        format: 'uuid',
        description: 'ID del ejercicio',
    })
    @ApiResponse({
        status: 200,
        description: 'Ejercicio actualizado',
        type: Exercise,
    })
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateExerciseDto: UpdateExerciseDto,
    ) {
        return this.exerciseService.update(id, updateExerciseDto);
    }

    @Delete(':id')
    @Roles(Role.ADMIN)
    @ApiOperation({ summary: 'Eliminar un ejercicio' })
    @ApiParam({
        name: 'id',
        type: 'string',
        format: 'uuid',
        description: 'ID del ejercicio',
    })
    @ApiResponse({ status: 200, description: 'Ejercicio eliminado' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.exerciseService.remove(id);
    }

    @Post('lesson/:lessonId/reorder')
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Reordenar ejercicios de una lección' })
    @ApiParam({
        name: 'lessonId',
        type: 'string',
        format: 'uuid',
        description: 'ID de la lección',
    })
    @ApiResponse({ status: 200, description: 'Ejercicios reordenados' })
    reorderExercises(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
        return this.exerciseService.reorderExercises(lessonId);
    }

    @Patch(':id/toggle-active')
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Alternar estado activo del ejercicio' })
    @ApiParam({
        name: 'id',
        type: 'string',
        format: 'uuid',
        description: 'ID del ejercicio',
    })
    @ApiResponse({
        status: 200,
        description: 'Estado activo actualizado',
        type: Exercise,
    })
    toggleActive(@Param('id', ParseUUIDPipe) id: string) {
        return this.exerciseService.toggleActive(id);
    }

    @Patch(':id/points/:points')
    @Roles(Role.ADMIN, Role.TEACHER)
    @ApiOperation({ summary: 'Actualizar puntos del ejercicio' })
    @ApiParam({
        name: 'id',
        type: 'string',
        format: 'uuid',
        description: 'ID del ejercicio',
    })
    @ApiParam({
        name: 'points',
        type: 'number',
        description: 'Puntos a asignar',
    })
    @ApiResponse({
        status: 200,
        description: 'Puntos actualizados',
        type: Exercise,
    })
    updatePoints(
        @Param('id', ParseUUIDPipe) id: string,
        @Param('points', ParseIntPipe) points: number,
    ) {
        return this.exerciseService.updatePoints(id, points);
    }

    @Post(':id/statistics')
    @ApiOperation({ summary: 'Actualizar estadísticas del ejercicio' })
    @ApiParam({
        name: 'id',
        type: 'string',
        format: 'uuid',
        description: 'ID del ejercicio',
    })
    @ApiResponse({
        status: 200,
        description: 'Estadísticas actualizadas',
        type: Exercise,
    })
    updateStatistics(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('completionTime', ParseIntPipe) completionTime: number,
        @Body('success') success: boolean,
    ) {
        return this.exerciseService.updateStatistics(id, completionTime, success);
    }
} 