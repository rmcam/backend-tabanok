import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { CollaborationReward } from '../../features/gamification/entities/collaboration-reward.entity';

export default class CollaborationRewardSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    // TODO: Implementar la lógica para poblar la entidad CollaborationReward.
  }
}
