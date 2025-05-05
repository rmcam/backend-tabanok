import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { Leaderboard } from '../../features/gamification/entities/leaderboard.entity';

export default class LeaderboardSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    // TODO: Implementar la lógica para poblar la entidad Leaderboard.
  }
}
