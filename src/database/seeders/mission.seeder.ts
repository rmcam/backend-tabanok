import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { Mission } from '../../features/gamification/entities/mission.entity';

export default class MissionSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    // TODO: Implementar la lógica para poblar la entidad Mission.
  }
}
