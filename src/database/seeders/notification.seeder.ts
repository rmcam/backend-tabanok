import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { Notification } from '../../features/notifications/entities/notification.entity';

export default class NotificationSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    // TODO: Implementar la lógica para poblar la entidad Notification.
  }
}
