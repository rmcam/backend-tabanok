import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed'; 
import { Notification, NotificationType, NotificationPriority, NotificationStatus } from '../../features/notifications/entities/notification.entity';
import { User } from '../../auth/entities/user.entity'; // Import User entity
import { Achievement } from '../../features/gamification/entities/achievement.entity'; // Import Achievement entity
import { Mission } from '../../features/gamification/entities/mission.entity'; // Import Mission entity
import { CollaborationReward } from '../../features/gamification/entities/collaboration-reward.entity'; // Import CollaborationReward entity

export class NotificationSeeder extends DataSourceAwareSeed {
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

    // Crear una notificación de bienvenida para cada usuario si no existe
    for (const user of users) {
        const welcomeNotificationTitle = '¡Bienvenido a Tabanok!';
        const existingNotification = await notificationRepository.findOne({
            where: { user: { id: user.id }, title: welcomeNotificationTitle }
        });

        if (!existingNotification) {
            notificationsToSeed.push(
                notificationRepository.create({
                    user: user,
                    type: NotificationType.SYSTEM,
                    title: welcomeNotificationTitle,
                    message: `Hola ${user.firstName}, ¡gracias por unirte a Tabanok! Estamos emocionados de ayudarte a aprender Kamëntsá.`,
                    priority: NotificationPriority.HIGH,
                    status: NotificationStatus.UNREAD,
                    isRead: false,
                    readAt: null,
                    metadata: { /* Eliminar category y importance si no existen en la entidad */ },
                    isActive: true,
                    isPush: true,
                    isEmail: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
            );
        } else {
            console.log(`Welcome notification for user "${user.email}" already exists. Skipping.`);
        }
    }

    // Use a single save call for efficiency
    await notificationRepository.save(notificationsToSeed);
    console.log(`Seeded ${notificationsToSeed.length} notification records.`);
    console.log('Notification seeder finished.');
  }
}
