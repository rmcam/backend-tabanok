import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { Notification, NotificationType, NotificationPriority, NotificationStatus } from '../../features/notifications/entities/notification.entity';
import { User } from '../../auth/entities/user.entity'; // Import User entity
import { Achievement } from '../../features/gamification/entities/achievement.entity'; // Import Achievement entity
import { Mission } from '../../features/gamification/entities/mission.entity'; // Import Mission entity
import { CollaborationReward } from '../../features/gamification/entities/collaboration-reward.entity'; // Import CollaborationReward entity

export default class NotificationSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const notificationRepository = this.dataSource.getRepository(Notification);
    const userRepository = this.dataSource.getRepository(User); // Get User repository
    const achievementRepository = this.dataSource.getRepository(Achievement); // Get Achievement repository
    const missionRepository = this.dataSource.getRepository(Mission); // Get Mission repository
    const collaborationRewardRepository = this.dataSource.getRepository(CollaborationReward); // Get CollaborationReward repository


    const users = await userRepository.find(); // Fetch all users
    const achievements = await achievementRepository.find(); // Fetch all achievements
    const missions = await missionRepository.find(); // Fetch all missions
    const collaborationRewards = await collaborationRewardRepository.find(); // Fetch all collaboration rewards


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

            if (typeRoll < 0.3 && achievements.length > 0) { // 30% Achievement Unlocked (only if achievements exist)
                notificationType = NotificationType.ACHIEVEMENT_UNLOCKED;
                title = '¡Logro Desbloqueado!';
                const randomAchievement = achievements[Math.floor(Math.random() * achievements.length)];
                message = `Has desbloqueado el logro "${randomAchievement.name}".`; // Use real achievement name
                priority = NotificationPriority.HIGH;
                metadata = { resourceType: 'achievement', resourceId: randomAchievement.id }; // Use real achievement ID
            } else if (typeRoll < 0.5) { // 20% Level Up
                notificationType = NotificationType.LEVEL_UP;
                title = '¡Subiste de Nivel!';
                message = `Ahora eres Nivel ${user.level + Math.floor(Math.random() * 5) + 1}.`; // Simulate new level based on user's current level
                priority = NotificationPriority.HIGH;
                metadata = { additionalInfo: { newLevel: user.level + Math.floor(Math.random() * 5) + 1 } };
            } else if (typeRoll < 0.65 && users.length > 1) { // 15% New Message (only if more than one user exists)
                notificationType = NotificationType.NEW_MESSAGE;
                title = 'Nuevo Mensaje';
                const sender = users.filter(u => u.id !== user.id)[Math.floor(Math.random() * (users.length - 1))]; // Random sender (not the recipient)
                message = `Tienes un nuevo mensaje de ${sender.username}.`; // Use real sender username
                priority = NotificationPriority.HIGH;
                metadata = { resourceType: 'message', resourceId: 'fictional-message-id-' + Math.floor(Math.random() * 10 + 1), senderId: sender.id }; // Use real sender ID
            } else if (typeRoll < 0.75 && missions.length > 0) { // 10% Mission Completed (only if missions exist)
                notificationType = NotificationType.MISSION_COMPLETED;
                title = '¡Misión Cumplida!';
                const randomMission = missions[Math.floor(Math.random() * missions.length)];
                message = `Has completado la misión "${randomMission.title}".`; // Use real mission title
                priority = NotificationPriority.MEDIUM;
                metadata = { resourceType: 'mission', resourceId: randomMission.id }; // Use real mission ID
            } else if (typeRoll < 0.85 && collaborationRewards.length > 0) { // 10% Collaboration Update (only if collaboration rewards exist)
                notificationType = NotificationType.COLLABORATION_UPDATE;
                title = 'Actualización de Colaboración';
                const randomReward = collaborationRewards[Math.floor(Math.random() * collaborationRewards.length)];
                message = `Tu contribución "${randomReward.title}" ha sido actualizada.`; // Use real reward title
                priority = NotificationPriority.MEDIUM;
                metadata = { resourceType: 'collaboration', resourceId: 'fictional-collaboration-id-' + Math.floor(Math.random() * 5 + 1) }; // Still using fictional ID for collaboration resource, as there's no specific entity for contributions
            } else { // 15% System Update (fallback if other types can't be generated)
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
