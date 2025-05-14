import { v4 as uuidv4 } from 'uuid';
import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { WebhookSubscription } from '../../features/webhooks/entities/webhook-subscription.entity';
import { WebhookEventType } from '../../features/webhooks/interfaces/webhook.interface';

export class WebhookSubscriptionSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const webhookSubscriptionRepository = this.dataSource.getRepository(WebhookSubscription);

    const now = new Date();
    const subscriptionsToSeed: Partial<WebhookSubscription>[] = [
      {
        id: uuidv4(), // Assign a generated UUID
        url: 'https://example.com/webhook/content-updates',
        events: [WebhookEventType.VERSION_CREATED, WebhookEventType.VERSION_UPDATED, WebhookEventType.VALIDATION_COMPLETED],
        secret: 'supersecretkey123',
        isActive: true,
        createdAt: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Created in last 90 days
        updatedAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Updated in last 30 days
        lastTriggeredAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Triggered in last 7 days
        failureCount: Math.floor(Math.random() * 5), // Random failure count
        metadata: { description: 'Suscripción para recibir actualizaciones de contenido.', contactEmail: 'admin@example.com' },
      },
      {
        id: uuidv4(), // Assign a generated UUID
        url: 'https://another-service.com/comment-notifications',
        events: [WebhookEventType.COMMENT_ADDED],
        secret: 'anothersecretkey456',
        isActive: true,
        createdAt: new Date(now.getTime() - Math.random() * 120 * 24 * 60 * 60 * 1000), // Created in last 120 days
        updatedAt: new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Updated in last 60 days
        lastTriggeredAt: new Date(now.getTime() - Math.random() * 3 * 24 * 60 * 60 * 1000), // Triggered in last 3 days
        failureCount: Math.floor(Math.random() * 2),
        metadata: { purpose: 'Notificar sobre nuevos comentarios.' },
      },
      {
        id: uuidv4(), // Assign a generated UUID
        url: 'https://backup-service.com/validation-alerts',
        events: [WebhookEventType.VALIDATION_COMPLETED],
        secret: 'backupalertsecret789',
        isActive: false, // Inactive subscription
        createdAt: new Date(now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000), // Created in last 180 days
        updatedAt: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Updated in last 90 days
        lastTriggeredAt: null, // Never triggered
        failureCount: 0,
        metadata: { notes: 'Suscripción de respaldo, actualmente inactiva.' },
      },
      {
        id: uuidv4(), // Assign a generated UUID
        url: 'https://monitoring-tool.com/webhook',
        events: [WebhookEventType.VERSION_CREATED, WebhookEventType.VALIDATION_COMPLETED],
        secret: 'monitoringsecretabc',
        isActive: true,
        createdAt: new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - Math.random() * 10 * 24 * 60 * 60 * 1000),
        lastTriggeredAt: new Date(now.getTime() - Math.random() * 1 * 24 * 60 * 60 * 1000), // Triggered recently
        failureCount: 0,
        metadata: { description: 'Suscripción para monitoreo de eventos clave.' },
      },
      {
        id: uuidv4(), // Assign a generated UUID
        url: 'https://data-warehouse.com/ingest',
        events: [WebhookEventType.VERSION_CREATED, WebhookEventType.VERSION_UPDATED, WebhookEventType.COMMENT_ADDED, WebhookEventType.VALIDATION_COMPLETED],
        secret: 'datawarehouse123',
        isActive: true,
        createdAt: new Date(now.getTime() - Math.random() * 240 * 24 * 60 * 60 * 1000), // Created longer ago
        updatedAt: new Date(now.getTime() - Math.random() * 120 * 24 * 60 * 60 * 1000),
        lastTriggeredAt: new Date(now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000),
        failureCount: Math.floor(Math.random() * 10), // Higher failure count possible
        metadata: { purpose: 'Ingesta de datos para análisis histórico.' },
      },
    ];

    // Use a single save call for efficiency
    await webhookSubscriptionRepository.save(subscriptionsToSeed);
    console.log(`Seeded ${subscriptionsToSeed.length} webhook subscription records.`);
    console.log('WebhookSubscription seeder finished.');
  }
}
