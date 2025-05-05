import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { MentorSpecialization } from '../../features/gamification/entities/mentor-specialization.entity';

export default class MentorSpecializationSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    // TODO: Implementar la lógica para poblar la entidad MentorSpecialization.
  }
}
