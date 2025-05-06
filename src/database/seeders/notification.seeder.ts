import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { Notification, NotificationType, NotificationPriority, NotificationStatus } from '../../features/notifications/entities/notification.entity';

export default class NotificationSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(Notification);

    const now = new Date();
    const pastDate = new Date(now);
    pastDate.setDate(now.getDate() - 2);

    const notifications: Partial<Notification>[] = [
      {
        // user: { id: 'fictional-user-id-1' }, // Asociar a un usuario ficticio por ahora
        type: NotificationType.ACHIEVEMENT_UNLOCKED,
        title: '¡Logro Desbloqueado!',
        message: 'Has desbloqueado el logro "Primeros Pasos".',
        priority: NotificationPriority.HIGH,
        status: NotificationStatus.UNREAD,
        isRead: false,
        metadata: { resourceType: 'achievement', resourceId: 'fictional-achievement-id-1' },
        isActive: true,
        isPush: true,
        isEmail: false,
        createdAt: now,
      },
      {
        // user: { id: 'fictional-user-id-1' }, // Asociar a un usuario ficticio por ahora
        type: NotificationType.LEVEL_UP,
        title: '¡Subiste de Nivel!',
        message: 'Ahora eres Nivel 2. ¡Sigue aprendiendo!',
        priority: NotificationPriority.MEDIUM,
        status: NotificationStatus.READ,
        isRead: true,
        readAt: pastDate,
        metadata: { additionalInfo: { newLevel: 2 } },
        isActive: true,
        isPush: false,
        isEmail: true,
        createdAt: pastDate,
      },
      {
        // user: { id: 'fictional-user-id-2' }, // Asociar a un usuario ficticio por ahora
        type: NotificationType.SYSTEM,
        title: 'Actualización del Sistema',
        message: 'Hemos mejorado el rendimiento de la aplicación.',
        priority: NotificationPriority.LOW,
        status: NotificationStatus.ARCHIVED,
        isRead: true,
        readAt: pastDate,
        isActive: false,
        isPush: false,
        isEmail: false,
        createdAt: pastDate,
      },
    ];

    const moreNotifications: Partial<Notification>[] = [
      {
        // user: { id: 'fictional-user-id-3' },
        type: NotificationType.NEW_MESSAGE,
        title: 'Nuevo Mensaje de Mentor',
        message: 'Tienes un nuevo mensaje de tu mentor.',
        priority: NotificationPriority.HIGH,
        status: NotificationStatus.UNREAD,
        isRead: false,
        metadata: { resourceType: 'message', resourceId: 'fictional-message-id-1' },
        isActive: true,
        isPush: true,
        isEmail: false,
        createdAt: now,
      },
      {
        // user: { id: 'fictional-user-id-4' },
        type: NotificationType.MISSION_COMPLETED,
        title: '¡Misión Cumplida!',
        message: 'Has completado la misión "Practica 5 Ejercicios Semanales".',
        priority: NotificationPriority.MEDIUM,
        status: NotificationStatus.READ,
        isRead: true,
        readAt: pastDate,
        metadata: { resourceType: 'mission', resourceId: 'fictional-mission-id-2' },
        isActive: true,
        isPush: false,
        isEmail: true,
        createdAt: pastDate,
      },
      {
        // user: { id: 'fictional-user-id-1' },
        type: NotificationType.COLLABORATION_UPDATE,
        title: 'Actualización de Colaboración',
        message: 'Tu contribución al diccionario ha sido revisada.',
        priority: NotificationPriority.LOW,
        status: NotificationStatus.UNREAD,
        isRead: false,
        metadata: { resourceType: 'collaboration', resourceId: 'fictional-collaboration-id-1' },
        isActive: true,
        isPush: false,
        isEmail: false,
        createdAt: now,
      },
    ];

    notifications.push(...moreNotifications);

    for (const notificationData of notifications) {
      const notification = repository.create(notificationData);
      await repository.save(notification);
    }
  }
}
