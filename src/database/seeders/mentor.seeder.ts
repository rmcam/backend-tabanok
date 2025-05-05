import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { Mentor } from '../../features/gamification/entities/mentor.entity';

export default class MentorSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    // TODO: Implementar la lógica para poblar la entidad Mentor.
  }
}
