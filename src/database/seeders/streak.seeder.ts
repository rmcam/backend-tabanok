import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { Streak } from '../../features/gamification/entities/streak.entity';

export default class StreakSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    // TODO: Implementar la lógica para poblar la entidad Streak.
  }
}
