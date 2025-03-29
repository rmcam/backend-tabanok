import { ApiProperty } from '@nestjs/swagger';
import { NotificationPriority, NotificationStatus, NotificationType } from '../entities/notification.entity';

export class NotificationResponseDto {
    @ApiProperty({ description: 'ID de la notificación' })
    id: string;

    @ApiProperty({ description: 'Tipo de notificación', enum: NotificationType })
    type: NotificationType;

    @ApiProperty({ description: 'Título de la notificación' })
    title: string;

    @ApiProperty({ description: 'Mensaje de la notificación' })
    message: string;

    @ApiProperty({ description: 'Prioridad de la notificación', enum: NotificationPriority })
    priority: NotificationPriority;

    @ApiProperty({ description: 'Estado de la notificación', enum: NotificationStatus })
    status: NotificationStatus;

    @ApiProperty({ description: 'Indica si la notificación ha sido leída' })
    isRead: boolean;

    @ApiProperty({ description: 'Fecha en que se leyó la notificación', required: false })
    readAt?: Date;

    @ApiProperty({ description: 'Metadatos adicionales de la notificación', required: false })
    metadata?: {
        actionType?: string;
        actionUrl?: string;
        resourceId?: string;
        resourceType?: string;
        additionalInfo?: Record<string, any>;
    };

    @ApiProperty({ description: 'ID del usuario al que pertenece la notificación' })
    userId: string;

    @ApiProperty({ description: 'Indica si la notificación está activa' })
    isActive: boolean;

    @ApiProperty({ description: 'Indica si la notificación debe enviarse como push' })
    isPush: boolean;

    @ApiProperty({ description: 'Indica si la notificación debe enviarse por email' })
    isEmail: boolean;

    @ApiProperty({ description: 'Fecha de creación' })
    createdAt: Date;

    @ApiProperty({ description: 'Fecha de última actualización' })
    updatedAt: Date;
} 