import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { WebhookSubscription } from '../../features/webhooks/entities/webhook-subscription.entity';
import { WebhookEventType } from '../../features/webhooks/interfaces/webhook.interface';

export default class WebhookSubscriptionSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(WebhookSubscription);

    const now = new Date();
    const pastDate = new Date(now);
    pastDate.setDate(now.getDate() - 1);

    const subscriptions: Partial<WebhookSubscription>[] = [
      {
        url: 'https://example.com/webhook/listener-1',
        events: [WebhookEventType.VERSION_CREATED, WebhookEventType.COMMENT_ADDED], // Corregido a eventos existentes
        secret: 'supersecretkey1',
        isActive: true,
        createdAt: pastDate,
        updatedAt: pastDate,
        lastTriggeredAt: null,
        failureCount: 0,
        metadata: { description: 'Suscripción para eventos de versión y comentarios.' }, // Descripción actualizada
      },
      {
        url: 'https://another-service.com/webhook',
        events: [WebhookEventType.VALIDATION_COMPLETED], // Corregido a evento existente
        secret: 'anothersecretkey2',
        isActive: true,
        createdAt: pastDate,
        updatedAt: now,
        lastTriggeredAt: pastDate,
        failureCount: 1,
        metadata: { tags: ['content', 'validation'] },
      },
      {
        url: 'https://backup-service.com/alerts',
        events: [WebhookEventType.VERSION_UPDATED], // Corregido a evento existente (ejemplo)
        secret: 'backupalertsecret',
        isActive: false,
        createdAt: pastDate,
        updatedAt: pastDate,
        lastTriggeredAt: null,
        failureCount: 5,
        metadata: { description: 'Suscripción de respaldo para actualizaciones de versión.' }, // Descripción actualizada
      },
    ];

    const moreSubscriptions: Partial<WebhookSubscription>[] = [
      {
        url: 'https://logging-service.com/log',
        events: [WebhookEventType.VERSION_CREATED, WebhookEventType.VERSION_UPDATED, WebhookEventType.VALIDATION_COMPLETED],
        secret: 'loggingsecret',
        isActive: true,
        createdAt: pastDate,
        updatedAt: now,
        lastTriggeredAt: now,
        failureCount: 0,
        metadata: { description: 'Suscripción para logging de eventos de contenido.' },
      },
      {
        url: 'https://analytics-service.com/data',
        events: [WebhookEventType.COMMENT_ADDED],
        secret: 'analyticssecret',
        isActive: true,
        createdAt: pastDate,
        updatedAt: pastDate,
        lastTriggeredAt: null,
        failureCount: 0,
        metadata: { purpose: 'analytics' },
      },
      {
        url: 'https://external-app.com/notifications',
        events: [WebhookEventType.VALIDATION_COMPLETED],
        secret: 'externalappsecret',
        isActive: false, // Suscripción inactiva
        createdAt: pastDate,
        updatedAt: pastDate,
        lastTriggeredAt: null,
        failureCount: 0,
        metadata: { notes: 'Pendiente de configuración en el servicio externo.' },
      },
    ];

    subscriptions.push(...moreSubscriptions);

    for (const subscriptionData of subscriptions) {
      const subscription = repository.create(subscriptionData);
      await repository.save(subscription);
    }
  }
}
