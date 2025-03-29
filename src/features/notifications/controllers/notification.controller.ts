import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetUser } from '../../../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { NotificationResponseDto } from '../dto/notification-response.dto';
import { NotificationService } from '../services/notification.service';

@ApiTags('user-notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Post()
    @ApiOperation({
        summary: 'Crear notificación',
        description: 'Crea una nueva notificación en el sistema'
    })
    @ApiBody({ type: CreateNotificationDto })
    @ApiResponse({
        status: 201,
        description: 'Notificación creada exitosamente',
        type: NotificationResponseDto
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
    async createNotification(
        @Body() createNotificationDto: CreateNotificationDto
    ): Promise<NotificationResponseDto> {
        return this.notificationService.createNotification(createNotificationDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Listar notificaciones',
        description: 'Obtiene la lista de notificaciones del usuario'
    })
    @ApiQuery({
        name: 'isRead',
        required: false,
        type: Boolean,
        description: 'Filtrar por estado de lectura'
    })
    @ApiResponse({
        status: 200,
        description: 'Lista de notificaciones obtenida exitosamente',
        type: [NotificationResponseDto]
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    async getUserNotifications(
        @GetUser('id') userId: string,
        @Query('isRead') isRead?: boolean
    ): Promise<NotificationResponseDto[]> {
        return this.notificationService.getUserNotifications(userId, { isRead });
    }

    @Put(':id/read')
    @ApiOperation({
        summary: 'Marcar como leída',
        description: 'Marca una notificación específica como leída'
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador único de la notificación',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Notificación marcada como leída exitosamente',
        type: NotificationResponseDto
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Notificación no encontrada'
    })
    async markAsRead(
        @Param('id') notificationId: string
    ): Promise<NotificationResponseDto> {
        return this.notificationService.markAsRead(notificationId);
    }

    @Put('mark-all-read')
    @ApiOperation({
        summary: 'Marcar todas como leídas',
        description: 'Marca todas las notificaciones del usuario como leídas'
    })
    @ApiResponse({
        status: 200,
        description: 'Notificaciones marcadas como leídas exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    async markAllAsRead(@GetUser('id') userId: string): Promise<void> {
        return this.notificationService.markAllAsRead(userId);
    }

    @Put(':id/archive')
    @ApiOperation({
        summary: 'Archivar notificación',
        description: 'Archiva una notificación específica'
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador único de la notificación',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Notificación archivada exitosamente',
        type: NotificationResponseDto
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Notificación no encontrada'
    })
    async archiveNotification(
        @Param('id') notificationId: string
    ): Promise<NotificationResponseDto> {
        return this.notificationService.archiveNotification(notificationId);
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Eliminar notificación',
        description: 'Elimina una notificación específica'
    })
    @ApiParam({
        name: 'id',
        description: 'Identificador único de la notificación',
        type: 'string'
    })
    @ApiResponse({
        status: 200,
        description: 'Notificación eliminada exitosamente'
    })
    @ApiResponse({
        status: 401,
        description: 'No autorizado'
    })
    @ApiResponse({
        status: 404,
        description: 'Notificación no encontrada'
    })
    async deleteNotification(
        @Param('id') notificationId: string
    ): Promise<void> {
        return this.notificationService.deleteNotification(notificationId);
    }
} 