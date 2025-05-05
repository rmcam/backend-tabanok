import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { MentorshipRelation } from '../../features/gamification/entities/mentorship-relation.entity';

export default class MentorshipRelationSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    // TODO: Implementar la lógica para poblar la entidad MentorshipRelation.
  }
}
