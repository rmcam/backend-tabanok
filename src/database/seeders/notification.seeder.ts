import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { Notification, NotificationType, NotificationPriority, NotificationStatus } from '../../features/notifications/entities/notification.entity';
import { User } from '../../auth/entities/user.entity'; // Import User entity

export default class NotificationSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const notificationRepository = this.dataSource.getRepository(Notification);
    const userRepository = this.dataSource.getRepository(User); // Get User repository

    const users = await userRepository.find(); // Fetch all users

    if (users.length === 0) {
      console.log('Skipping NotificationSeeder: No users found.');
      return;
    }

    const notificationsToSeed: Partial<Notification>[] = [];
    const now = new Date();

    // Create notification records for users
    for (const user of users) {
        // Simulate a random number of notifications per user (0 to 10)
        const numNotifications = Math.floor(Math.random() * 11);

        for (let i = 0; i < numNotifications; i++) {
            // Simulate notification type, priority, and status
            const typeRoll = Math.random();
            let notificationType: NotificationType;
            let title: string;
            let message: string;
            let priority: NotificationPriority;
            let status: NotificationStatus;
            let isRead = false;
            let readAt: Date | null = null;
            let metadata: any = {};

            if (typeRoll < 0.3) { // 30% Achievement Unlocked
                notificationType = NotificationType.ACHIEVEMENT_UNLOCKED;
                title = '¡Logro Desbloqueado!';
                message = `Has desbloqueado un logro.`; // Generic message
                priority = NotificationPriority.HIGH;
                metadata = { resourceType: 'achievement', resourceId: 'fictional-achievement-id-' + Math.floor(Math.random() * 20 + 1) };
            } else if (typeRoll < 0.5) { // 20% Level Up
                notificationType = NotificationType.LEVEL_UP;
                title = '¡Subiste de Nivel!';
                message = `Ahora eres Nivel ${Math.floor(Math.random() * 30 + 1)}.`; // Generic message
                priority = NotificationPriority.HIGH;
                metadata = { additionalInfo: { newLevel: Math.floor(Math.random() * 30 + 1) } };
            } else if (typeRoll < 0.65) { // 15% New Message
                notificationType = NotificationType.NEW_MESSAGE;
                title = 'Nuevo Mensaje';
                message = 'Tienes un nuevo mensaje.';
                priority = NotificationPriority.HIGH;
                metadata = { resourceType: 'message', resourceId: 'fictional-message-id-' + Math.floor(Math.random() * 10 + 1) };
            } else if (typeRoll < 0.75) { // 10% Mission Completed
                notificationType = NotificationType.MISSION_COMPLETED;
                title = '¡Misión Cumplida!';
                message = 'Has completado una misión.'; // Generic message
                priority = NotificationPriority.MEDIUM;
                metadata = { resourceType: 'mission', resourceId: 'fictional-mission-id-' + Math.floor(Math.random() * 15 + 1) };
            } else if (typeRoll < 0.85) { // 10% Collaboration Update
                notificationType = NotificationType.COLLABORATION_UPDATE;
                title = 'Actualización de Colaboración';
                message = 'Tu contribución ha sido actualizada.'; // Generic message
                priority = NotificationPriority.MEDIUM;
                metadata = { resourceType: 'collaboration', resourceId: 'fictional-collaboration-id-' + Math.floor(Math.random() * 5 + 1) };
            } else { // 15% System Update
                notificationType = NotificationType.SYSTEM;
                title = 'Actualización del Sistema';
                message = 'Hemos realizado mejoras.'; // Generic message
                priority = NotificationPriority.LOW;
                metadata = {};
            }

            // Simulate read status and dates
            const statusRoll2 = Math.random();
            if (statusRoll2 < 0.6) { // 60% Unread
                status = NotificationStatus.UNREAD;
                isRead = false;
                readAt = null;
            } else if (statusRoll2 < 0.9) { // 30% Read
                status = NotificationStatus.READ;
                isRead = true;
                readAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Read in last 7 days
            } else { // 10% Archived
                status = NotificationStatus.ARCHIVED;
                isRead = true; // Archived notifications are considered read
                readAt = new Date(now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000); // Archived in last 14 days
            }

            const createdAt = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000); // Created in last 90 days


            notificationsToSeed.push(
                notificationRepository.create({
                    user: user, // Associate User entity
                    // Removed userId: user.id, // Associate userId
                    type: notificationType,
                    title: title,
                    message: message,
                    priority: priority,
                    status: status,
                    isRead: isRead,
                    readAt: readAt,
                    metadata: metadata,
                    isActive: true, // Assume active unless archived
                    isPush: Math.random() > 0.5, // Random push preference
                    isEmail: Math.random() > 0.5, // Random email preference
                    createdAt: createdAt,
                    updatedAt: readAt || createdAt, // Updated at read time or creation time
                })
            );
        }
    }

    // Use a single save call for efficiency
    await notificationRepository.save(notificationsToSeed);
    console.log(`Seeded ${notificationsToSeed.length} notification records.`);
    console.log('Notification seeder finished.');
  }
}
