import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/entities/user.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import {
    CreateRewardDto,
    RewardFilterDto,
    RewardResponseDto,
    UserRewardFilterDto
} from '../dto/reward.dto';
import { UserRewardDto } from '../dto/user-reward.dto';
import { RewardService } from '../services/reward.service';

@ApiTags('gamification-rewards')
@ApiBearerAuth()
@Controller('rewards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RewardController {
    constructor(private readonly rewardService: RewardService) { }

    @Post()
    @Roles(UserRole.ADMIN)
    @ApiOperation({
        summary: 'Crear recompensa',
        description: 'Crea una nueva recompensa en el sistema'
    })
    @ApiResponse({
        status: 201,
        description: 'Recompensa creada exitosamente',
        type: RewardResponseDto
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
    async createReward(@Body() createRewardDto: CreateRewardDto): Promise<RewardResponseDto> {
        return this.rewardService.createReward(createRewardDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Listar recompensas',
        description: 'Obtiene la lista de todas las recompensas disponibles'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de recompensas obtenida exitosamente',
        type: [RewardResponseDto]
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    async getAvailableRewards(@Query() filters: RewardFilterDto): Promise<RewardResponseDto[]> {
        return this.rewardService.getAvailableRewards(filters);
    }

    @Post(':rewardId/award/:userId')
    @Roles(UserRole.ADMIN, UserRole.MODERATOR)
    @ApiOperation({
        summary: 'Otorgar recompensa',
        description: 'Otorga una recompensa específica a un usuario'
    })
    @ApiParam({
        name: 'rewardId',
        description: 'Identificador único de la recompensa',
        type: 'string'
    })
    @ApiParam({
        name: 'userId',
        description: 'Identificador único del usuario',
        type: 'string'
    })
    @ApiResponse({
        status: 201,
        description: 'Recompensa otorgada exitosamente',
        type: UserRewardDto
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
        description: 'Recompensa o usuario no encontrado'
    })
    async awardRewardToUser(
        @Param('userId') userId: string,
        @Param('rewardId') rewardId: string
    ): Promise<UserRewardDto> {
        return this.rewardService.awardRewardToUser(userId, rewardId);
    }

    @Get('user/:userId')
    @ApiOperation({
        summary: 'Obtener recompensas por usuario',
        description: 'Obtiene todas las recompensas asociadas a un usuario específico'
    })
    @ApiParam({
        name: 'userId',
        description: 'Identificador único del usuario',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de recompensas obtenida exitosamente',
        type: [UserRewardDto]
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Usuario no encontrado'
    })
    async getUserRewards(
        @Param('userId') userId: string,
        @Query() filters: UserRewardFilterDto
    ): Promise<UserRewardDto[]> {
        const userRewards = await this.rewardService.getUserRewards(userId);
        return userRewards.map(userReward => ({
            userId: userReward.userId,
            rewardId: userReward.rewardId,
            status: userReward.status,
            metadata: userReward.metadata,
            consumedAt: userReward.consumedAt,
            expiresAt: userReward.expiresAt,
            dateAwarded: userReward.dateAwarded,
            createdAt: userReward.createdAt
        }));
    }

    @Put('user/:userId/reward/:rewardId/consume')
    @ApiOperation({
        summary: 'Consumir recompensa',
        description: 'Marca una recompensa como consumida por el usuario'
    })
    @ApiParam({
        name: 'userId',
        description: 'Identificador único del usuario',
        type: 'string'
    })
    @ApiParam({
        name: 'rewardId',
        description: 'Identificador único de la recompensa',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Recompensa consumida exitosamente',
        type: UserRewardDto
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Recompensa no encontrada'
    })
    async consumeReward(
        @Param('userId') userId: string,
        @Param('rewardId') rewardId: string
    ): Promise<UserRewardDto> {
        return this.rewardService.consumeReward(userId, rewardId);
    }

    @Get('user/:userId/reward/:rewardId/status')
    @ApiOperation({
        summary: 'Verificar estado recompensa',
        description: 'Obtiene el estado actual de una recompensa específica para un usuario'
    })
    @ApiParam({
        name: 'userId',
        description: 'Identificador único del usuario',
        type: 'string'
    })
    @ApiParam({
        name: 'rewardId',
        description: 'Identificador único de la recompensa',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Estado de recompensa verificado exitosamente',
        type: UserRewardDto
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Recompensa no encontrada'
    })
    async checkRewardStatus(
        @Param('userId') userId: string,
        @Param('rewardId') rewardId: string
    ): Promise<UserRewardDto> {
        return this.rewardService.checkAndUpdateRewardStatus(userId, rewardId);
    }

    @Post('check-consistency/:userId')
    @ApiOperation({
        summary: 'Verificar consistencia',
        description: 'Verifica la consistencia de todas las recompensas de un usuario'
    })
    @ApiParam({
        name: 'userId',
        description: 'Identificador único del usuario',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Verificación de consistencia completada exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Usuario no encontrado'
    })
    async checkConsistencyRewards(
        @Param('userId') userId: string
    ): Promise<void> {
        return this.rewardService.checkConsistencyRewards(userId);
    }
} 