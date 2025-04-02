import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/entities/user.entity'; // Ruta corregida
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { AchievementFilterDto, CreateAchievementDto, UpdateProgressDto } from '../dto/cultural-achievement.dto';
import { CulturalAchievementService } from '../services/cultural-achievement.service';

@ApiTags('gamification-achievements')
@ApiBearerAuth()
@Controller('cultural-achievements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CulturalAchievementController {
    constructor(private readonly achievementService: CulturalAchievementService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Crear logro cultural',
        description: 'Crea un nuevo logro cultural en el sistema'
    })
    @ApiResponse({
        status: 201,
        description: 'Logro cultural creado exitosamente'
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
    async createAchievement(@Body() createAchievementDto: CreateAchievementDto) {
        return this.achievementService.createAchievement(createAchievementDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Listar logros culturales',
        description: 'Obtiene la lista de todos los logros culturales disponibles'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de logros culturales obtenida exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    async getAchievements(@Query() filter: AchievementFilterDto) {
        return this.achievementService.getAchievements(filter.category);
    }

    @Post(':achievementId/progress/:userId')
    @Roles(UserRole.ADMIN, UserRole.MODERATOR)
    @ApiOperation({
        summary: 'Inicializar progreso',
        description: 'Inicializa el progreso de un logro cultural para un usuario específico'
    })
    @ApiParam({
        name: 'achievementId',
        description: 'Identificador único del logro cultural',
        type: 'string'
    })
    @ApiParam({
        name: 'userId',
        description: 'Identificador único del usuario',
        type: 'string'
    })
    @ApiResponse({
        status: 201,
        description: 'Progreso inicializado exitosamente'
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
        description: 'No tiene permisos suficientes para realizar esta acción'
    })
    @ApiResponse({
        status: 404,
        description: 'Logro o usuario no encontrado'
    })
    async initializeProgress(
        @Param('userId') userId: string,
        @Param('achievementId') achievementId: string
    ) {
        return this.achievementService.initializeUserProgress(userId, achievementId);
    }

    @Put(':achievementId/progress/:userId')
    @ApiOperation({
        summary: 'Actualizar progreso',
        description: 'Actualiza el progreso de un logro cultural para un usuario específico'
    })
    @ApiParam({
        name: 'achievementId',
        description: 'Identificador único del logro cultural',
        type: 'string'
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
        description: 'Progreso no encontrado'
    })
    async updateProgress(
        @Param('userId') userId: string,
        @Param('achievementId') achievementId: string,
        @Body() updateProgressDto: UpdateProgressDto
    ) {
        return this.achievementService.updateProgress(
            userId,
            achievementId,
            updateProgressDto.updates
        );
    }

    @Get('users/:userId')
    @ApiOperation({
        summary: 'Obtener logros por usuario',
        description: 'Obtiene todos los logros culturales asociados a un usuario específico'
    })
    @ApiParam({
        name: 'userId',
        description: 'Identificador único del usuario',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de logros obtenida exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Usuario no encontrado'
    })
    async getUserAchievements(@Param('userId') userId: string) {
        return this.achievementService.getUserAchievements(userId);
    }

    @Get(':achievementId/progress/:userId')
    @ApiOperation({
        summary: 'Obtener progreso específico',
        description: 'Obtiene el progreso de un logro cultural específico para un usuario'
    })
    @ApiParam({
        name: 'achievementId',
        description: 'Identificador único del logro cultural',
        type: 'string'
    })
    @ApiParam({
        name: 'userId',
        description: 'Identificador único del usuario',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Progreso obtenido exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Progreso no encontrado'
    })
    async getAchievementProgress(
        @Param('userId') userId: string,
        @Param('achievementId') achievementId: string
    ) {
        return this.achievementService.getAchievementProgress(userId, achievementId);
    }
}
