import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { NotificationPriority, NotificationStatus, NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
    @IsUUID()
    userId: string;

    @IsEnum(NotificationType)
    type: NotificationType;

    @IsString()
    title: string;

    @IsString()
    message: string;

    @IsOptional()
    @IsEnum(NotificationPriority)
    priority?: NotificationPriority;

    @IsOptional()
    @IsObject()
    metadata?: Record<string, any>;

    @IsOptional()
    @IsBoolean()
    isPush?: boolean;

    @IsOptional()
    @IsBoolean()
    isEmail?: boolean;
}

export class NotificationFilterDto {
    @IsOptional()
    @IsEnum(NotificationStatus)
    status?: NotificationStatus;

    @IsOptional()
    @IsEnum(NotificationType)
    type?: NotificationType;

    @IsOptional()
    @IsBoolean()
    isRead?: boolean;
}

export class NotificationResponseDto {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    priority: NotificationPriority;
    status: NotificationStatus;
    metadata?: Record<string, any>;
    isRead: boolean;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
} 