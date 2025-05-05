import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { WebhookSubscription } from '../../features/webhooks/entities/webhook-subscription.entity';

export default class WebhookSubscriptionSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    // TODO: Implementar la lógica para poblar la entidad WebhookSubscription.
  }
}
