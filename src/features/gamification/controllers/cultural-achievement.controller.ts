import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Query, UseGuards, ValidationPipe } from '@nestjs/common'; // Importar ParseUUIDPipe y ValidationPipe
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger'; // Importar ApiBody
import { Roles } from '../../../auth/decorators/roles.decorator';
import { AppPermission } from '../../../auth/enums/permission.enum'; // Import AppPermission
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { AchievementFilterDto, CreateAchievementDto, UpdateProgressDto } from '../dto/cultural-achievement.dto';
import { CulturalAchievementService } from '../services/cultural-achievement.service';

@ApiTags('Gamification - Cultural Achievements') // Mejorar Tag
@ApiBearerAuth()
@Controller('cultural-achievements') // Añadir prefijo API
@UseGuards(JwtAuthGuard, RolesGuard)
export class CulturalAchievementController {
    constructor(private readonly achievementService: CulturalAchievementService) { }

    @Post()
    @Roles(AppPermission.CREATE_CULTURAL_ACHIEVEMENT) // Use permission instead of role
    @ApiOperation({
        summary: 'Crear Logro Cultural (Admin)',
        description: 'Crea un nuevo logro cultural. Requiere rol de Administrador.'
    })
    @ApiBody({ type: CreateAchievementDto }) // Documentar Body
    @ApiResponse({
        status: 201,
        description: 'Logro cultural creado exitosamente.'
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
        description: 'Acceso denegado. Rol de Administrador requerido.'
    })
    async createAchievement(@Body(ValidationPipe) createAchievementDto: CreateAchievementDto) { // Aplicar ValidationPipe
        return this.achievementService.createAchievement(
            createAchievementDto.name,
            createAchievementDto.description,
            createAchievementDto.category,
            createAchievementDto.type,
            createAchievementDto.tier,
            createAchievementDto.requirements,
            createAchievementDto.pointsReward
        );
    }

    @Get()
    @Roles(AppPermission.READ_CULTURAL_ACHIEVEMENTS_LIST)
    @ApiOperation({
        summary: 'Listar Logros Culturales',
        description: 'Obtiene la lista de logros culturales, opcionalmente filtrados por categoría.'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de logros culturales obtenida exitosamente.'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    async getAchievements(@Query() filter: AchievementFilterDto) {
        return this.achievementService.getAchievements(filter.category);
    }

    @Post(':achievementId/progress/:userId')
    @Roles(AppPermission.INITIALIZE_CULTURAL_ACHIEVEMENT_PROGRESS) // Use permission instead of roles
    @ApiOperation({
        summary: 'Inicializar progreso',
        description: 'Inicializa el progreso de un logro cultural para un usuario. Requiere rol Admin o Moderador.'
    })
    @ApiParam({
        name: 'achievementId',
        description: 'ID del logro cultural (UUID)',
        type: 'string',
        format: 'uuid'
    })
    @ApiParam({
        name: 'userId',
        description: 'ID del usuario (UUID)',
        type: 'string',
        format: 'uuid'
    })
    @ApiResponse({
        status: 201,
        description: 'Progreso inicializado exitosamente.'
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
        description: 'Acceso denegado. Rol Admin o Moderador requerido.'
    })
    @ApiResponse({
        status: 404,
        description: 'Logro o usuario no encontrado, o IDs inválidos.'
    })
    async initializeProgress(
        @Param('userId', ParseUUIDPipe) userId: string,
        @Param('achievementId', ParseUUIDPipe) achievementId: string
    ) {
        return this.achievementService.initializeUserProgress(userId, achievementId);
    }

    @Put(':achievementId/progress/:userId')
    @Roles(AppPermission.UPDATE_CULTURAL_ACHIEVEMENT_PROGRESS)
    @ApiOperation({
        summary: 'Actualizar progreso',
        description: 'Actualiza el progreso de un logro cultural para un usuario. Requiere datos de progreso en el cuerpo.'
    })
    @ApiParam({
        name: 'achievementId',
        description: 'ID del logro cultural (UUID)',
        type: 'string',
        format: 'uuid'
    })
    @ApiParam({
        name: 'userId',
        description: 'ID del usuario (UUID)',
        type: 'string',
        format: 'uuid'
    })
    @ApiBody({ type: UpdateProgressDto }) // Documentar Body
    @ApiResponse({
        status: 200,
        description: 'Progreso actualizado exitosamente.'
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
        description: 'Progreso no encontrado o IDs inválidos.'
    })
    async updateProgress(
        @Param('userId', ParseUUIDPipe) userId: string,
        @Param('achievementId', ParseUUIDPipe) achievementId: string,
        @Body(ValidationPipe) updateProgressDto: UpdateProgressDto
    ) {
        return this.achievementService.updateProgress(
            userId,
            achievementId,
            updateProgressDto.updates
        );
    }

    @Get('users/:userId')
    @Roles(AppPermission.READ_USER_CULTURAL_ACHIEVEMENTS)
    @ApiOperation({
        summary: 'Obtener logros por usuario',
        description: 'Obtiene todos los logros culturales (completados y en progreso) de un usuario.'
    })
    @ApiParam({
        name: 'userId',
        description: 'ID del usuario (UUID)',
        type: 'string',
        format: 'uuid'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de logros obtenida exitosamente.'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Usuario no encontrado o ID inválido.'
    })
    async getUserAchievements(@Param('userId', ParseUUIDPipe) userId: string) {
        return this.achievementService.getUserAchievements(userId);
    }

    @Get(':achievementId/progress/:userId')
    @Roles(AppPermission.READ_CULTURAL_ACHIEVEMENT_PROGRESS)
    @ApiOperation({
        summary: 'Obtener progreso específico',
        description: 'Obtiene el progreso detallado de un logro cultural específico para un usuario.'
    })
    @ApiParam({
        name: 'achievementId',
        description: 'ID del logro cultural (UUID)',
        type: 'string',
        format: 'uuid'
    })
    @ApiParam({
        name: 'userId',
        description: 'ID del usuario (UUID)',
        type: 'string',
        format: 'uuid'
    })
    @ApiResponse({
        status: 200,
        description: 'Progreso obtenido exitosamente.'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Progreso no encontrado o IDs inválidos.'
    })
    async getAchievementProgress(
        @Param('userId', ParseUUIDPipe) userId: string,
        @Param('achievementId', ParseUUIDPipe) achievementId: string
    ) {
        return this.achievementService.getAchievementProgress(userId, achievementId);
    }
}
