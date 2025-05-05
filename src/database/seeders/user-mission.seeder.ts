import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { UserMission } from '../../features/gamification/entities/user-mission.entity';

export default class UserMissionSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    // TODO: Implementar la lógica para poblar la entidad UserMission.
  }
}
