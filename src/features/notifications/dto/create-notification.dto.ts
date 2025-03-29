import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationPriority, NotificationType } from '../entities/notification.entity';

export interface NotificationMetadata {
    actionType?: string;
    actionUrl?: string;
    resourceId?: string;
    resourceType?: string;
    additionalInfo?: Record<string, any>;
    [key: string]: any; // Permite campos adicionales
}

export class CreateNotificationDto {
    @ApiProperty({ description: 'Tipo de notificación', enum: NotificationType })
    @IsEnum(NotificationType)
    @IsNotEmpty()
    type: NotificationType;

    @ApiProperty({ description: 'Título de la notificación' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'Mensaje de la notificación' })
    @IsString()
    @IsNotEmpty()
    message: string;

    @ApiProperty({ description: 'Prioridad de la notificación', enum: NotificationPriority })
    @IsEnum(NotificationPriority)
    @IsOptional()
    priority?: NotificationPriority;

    @ApiProperty({ description: 'ID del usuario al que se enviará la notificación' })
    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({ description: 'Metadatos adicionales de la notificación', required: false })
    @IsObject()
    @IsOptional()
    metadata?: NotificationMetadata;

    @ApiProperty({ description: 'Indica si la notificación debe enviarse como push', default: false })
    @IsBoolean()
    @IsOptional()
    isPush?: boolean;

    @ApiProperty({ description: 'Indica si la notificación debe enviarse por email', default: false })
    @IsBoolean()
    @IsOptional()
    isEmail?: boolean;
} 