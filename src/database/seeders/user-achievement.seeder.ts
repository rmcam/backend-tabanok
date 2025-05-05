import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { UserAchievement } from '../../features/gamification/entities/user-achievement.entity';

export default class UserAchievementSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    // TODO: Implementar la lógica para poblar la entidad UserAchievement.
  }
}
