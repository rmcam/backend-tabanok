import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { UserReward } from '../../features/gamification/entities/user-reward.entity';

export default class UserRewardSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    // TODO: Implementar la lógica para poblar la entidad UserReward.
  }
}
