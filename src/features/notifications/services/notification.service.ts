import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../auth/entities/user.entity';
import { CreateNotificationDto, NotificationMetadata } from '../dto/create-notification.dto';
import { NotificationResponseDto } from '../dto/notification-response.dto';
import { Notification, NotificationPriority, NotificationStatus, NotificationType } from '../entities/notification.entity';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) { }

    async createNotification(createNotificationDto: CreateNotificationDto): Promise<NotificationResponseDto> {
        const user = await this.userRepository.findOne({ where: { id: createNotificationDto.userId } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const notification = this.notificationRepository.create({
            ...createNotificationDto,
            user,
            priority: createNotificationDto.priority || NotificationPriority.MEDIUM,
            status: NotificationStatus.UNREAD,
            isRead: false
        });

        const savedNotification = await this.notificationRepository.save(notification);
        return this.mapToResponseDto(savedNotification);
    }

    async getUserNotifications(userId: string, filters?: { isRead?: boolean }): Promise<NotificationResponseDto[]> {
        const notifications = await this.notificationRepository.find({
            where: {
                user: { id: userId },
                isActive: true,
                ...(filters?.isRead !== undefined ? { isRead: filters.isRead } : {})
            },
            order: {
                createdAt: 'DESC'
            }
        });

        return notifications.map(notification => this.mapToResponseDto(notification));
    }

    async markAsRead(notificationId: string): Promise<NotificationResponseDto> {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId }
        });

        if (!notification) {
            throw new NotFoundException('Notificación no encontrada');
        }

        notification.isRead = true;
        notification.readAt = new Date();
        notification.status = NotificationStatus.READ;

        const updatedNotification = await this.notificationRepository.save(notification);
        return this.mapToResponseDto(updatedNotification);
    }

    async archiveNotification(notificationId: string): Promise<NotificationResponseDto> {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId }
        });

        if (!notification) {
            throw new NotFoundException('Notificación no encontrada');
        }

        notification.status = NotificationStatus.ARCHIVED;
        notification.isActive = false;

        const updatedNotification = await this.notificationRepository.save(notification);
        return this.mapToResponseDto(updatedNotification);
    }

    private mapToResponseDto(notification: Notification): NotificationResponseDto {
        return {
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            priority: notification.priority,
            status: notification.status,
            isRead: notification.isRead,
            readAt: notification.readAt,
            metadata: notification.metadata,
            userId: notification.user.id,
            isActive: notification.isActive,
            isPush: notification.isPush,
            isEmail: notification.isEmail,
            createdAt: notification.createdAt,
            updatedAt: notification.updatedAt
        };
    }

    async createAchievementNotification(userId: string, achievementName: string): Promise<void> {
        await this.createNotification({
            userId,
            type: NotificationType.ACHIEVEMENT_UNLOCKED,
            title: '¡Nuevo logro desbloqueado!',
            message: `Has desbloqueado el logro: ${achievementName}`,
            priority: NotificationPriority.HIGH,
            metadata: {
                actionType: 'view_achievement',
                resourceType: 'achievement',
                additionalInfo: { achievementName }
            }
        });
    }

    async createRewardNotification(userId: string, rewardName: string): Promise<void> {
        await this.createNotification({
            userId,
            type: NotificationType.REWARD_EARNED,
            title: '¡Nueva recompensa obtenida!',
            message: `Has obtenido la recompensa: ${rewardName}`,
            priority: NotificationPriority.HIGH,
            metadata: {
                actionType: 'view_reward',
                resourceType: 'reward',
                additionalInfo: { rewardName }
            }
        });
    }

    async createStreakMilestoneNotification(userId: string, days: number): Promise<void> {
        await this.createNotification({
            userId,
            type: NotificationType.STREAK_MILESTONE,
            title: '¡Nuevo hito de racha!',
            message: `¡Has mantenido tu racha de aprendizaje por ${days} días!`,
            priority: NotificationPriority.MEDIUM,
            metadata: {
                actionType: 'view_streak',
                resourceType: 'streak',
                additionalInfo: { days }
            }
        });
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this.notificationRepository.update(
            { user: { id: userId }, isRead: false },
            {
                isRead: true,
                readAt: new Date(),
                status: NotificationStatus.READ
            }
        );
    }

    async deleteNotification(notificationId: string): Promise<void> {
        const notification = await this.notificationRepository.findOne({
            where: { id: notificationId }
        });

        if (!notification) {
            throw new NotFoundException('Notificación no encontrada');
        }

        notification.isActive = false;
        await this.notificationRepository.save(notification);
    }

    async notifyAchievementUnlocked(userId: string, achievementName: string, achievementId: string): Promise<void> {
        const metadata: NotificationMetadata = {
            actionType: 'VIEW_ACHIEVEMENT',
            resourceId: achievementId,
            resourceType: 'achievement',
            additionalInfo: { achievementName },
            achievementId
        };

        await this.createNotification({
            userId,
            type: NotificationType.ACHIEVEMENT_UNLOCKED,
            title: '¡Logro Desbloqueado!',
            message: `Has desbloqueado el logro: ${achievementName}`,
            priority: NotificationPriority.HIGH,
            metadata,
            isPush: true
        });
    }

    async notifyRewardEarned(userId: string, rewardName: string, rewardId: string): Promise<void> {
        const metadata: NotificationMetadata = {
            actionType: 'VIEW_REWARD',
            resourceId: rewardId,
            resourceType: 'reward',
            additionalInfo: { rewardName },
            rewardId
        };

        await this.createNotification({
            userId,
            type: NotificationType.REWARD_EARNED,
            title: '¡Nueva Recompensa Obtenida!',
            message: `Has obtenido la recompensa: ${rewardName}`,
            priority: NotificationPriority.HIGH,
            metadata,
            isPush: true
        });
    }

    async notifyStreakMilestone(userId: string, days: number): Promise<void> {
        await this.createNotification({
            userId,
            type: NotificationType.STREAK_MILESTONE,
            title: '¡Racha de Consistencia!',
            message: `¡Increíble! Has mantenido tu racha por ${days} días consecutivos`,
            priority: NotificationPriority.MEDIUM,
            metadata: {
                actionType: 'VIEW_STREAK',
                resourceType: 'streak',
                additionalInfo: { streakDays: days }
            },
            isPush: true
        });
    }

    async notifyLevelUp(userId: string, newLevel: number): Promise<void> {
        const metadata: NotificationMetadata = {
            actionType: 'VIEW_PROFILE',
            resourceType: 'level',
            additionalInfo: { newLevel },
            level: newLevel
        };

        await this.createNotification({
            userId,
            type: NotificationType.LEVEL_UP,
            title: '¡Has Subido de Nivel!',
            message: `¡Felicitaciones! Has alcanzado el nivel ${newLevel}`,
            priority: NotificationPriority.HIGH,
            metadata,
            isPush: true
        });
    }
} 