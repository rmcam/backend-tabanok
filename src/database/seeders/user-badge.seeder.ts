import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { UserBadge } from '../../features/gamification/entities/user-badge.entity';

export default class UserBadgeSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    // TODO: Implementar la lógica para poblar la entidad UserBadge.
  }
}
