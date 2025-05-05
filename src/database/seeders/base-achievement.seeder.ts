import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { BaseAchievement } from '../../features/gamification/entities/base-achievement.entity';

export default class BaseAchievementSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    // TODO: Implementar la lógica para poblar la entidad BaseAchievement.
  }
}
