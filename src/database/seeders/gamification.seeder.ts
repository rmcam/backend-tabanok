import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { Gamification } from '../../features/gamification/entities/gamification.entity';

export default class GamificationSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    // TODO: Implementar la lógica para poblar la entidad Gamification.
  }
}
