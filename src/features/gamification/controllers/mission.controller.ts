import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/entities/user.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { CreateMissionDto } from '../dto/mission.dto';
import { MissionType } from '../entities/mission.entity';
import { MissionService } from '../services/mission.service';

@ApiTags('gamification-missions')
@ApiBearerAuth()
@Controller('missions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MissionController {
    constructor(private readonly missionService: MissionService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Crear misión',
        description: 'Crea una nueva misión en el sistema'
    })
    @ApiResponse({
        status: 201,
        description: 'Misión creada exitosamente'
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
        description: 'No tiene permisos de administrador para realizar esta acción'
    })
    async createMission(@Body() createMissionDto: CreateMissionDto) {
        return this.missionService.createMission(createMissionDto);
    }

    @Get('active/:userId')
    @ApiOperation({
        summary: 'Obtener misiones activas',
        description: 'Obtiene la lista de misiones activas para un usuario específico'
    })
    @ApiParam({
        name: 'userId',
        description: 'Identificador único del usuario',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de misiones obtenida exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    async getActiveMissions(@Param('userId') userId: string) {
        return this.missionService.getActiveMissions(userId);
    }

    @Put(':userId/progress')
    @ApiOperation({
        summary: 'Actualizar progreso',
        description: 'Actualiza el progreso de una misión para un usuario específico'
    })
    @ApiParam({
        name: 'userId',
        description: 'Identificador único del usuario',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Progreso actualizado exitosamente'
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
        status: 404,
        description: 'Usuario no encontrado'
    })
    async updateProgress(
        @Param('userId') userId: string,
        @Body('type') type: MissionType,
        @Body('progress') progress: number
    ) {
        return this.missionService.updateMissionProgress(userId, type, progress);
    }

    @Post('generate/daily')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Generar misiones diarias',
        description: 'Genera las misiones diarias del sistema'
    })
    @ApiResponse({
        status: 201,
        description: 'Misiones diarias generadas exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 403,
        description: 'No tiene permisos de administrador para realizar esta acción'
    })
    async generateDailyMissions() {
        return this.missionService.generateDailyMissions();
    }

    @Post('generate/weekly')
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Generar misiones semanales',
        description: 'Genera las misiones semanales del sistema'
    })
    @ApiResponse({
        status: 201,
        description: 'Misiones semanales generadas exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 403,
        description: 'No tiene permisos de administrador para realizar esta acción'
    })
    async generateWeeklyMissions() {
        return this.missionService.generateWeeklyMissions();
    }
} 