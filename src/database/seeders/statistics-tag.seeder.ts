import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { Tag } from '../../features/statistics/entities/statistics-tag.entity';

export default class TagSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    // TODO: Implementar la lógica para poblar la entidad Tag.
  }
}
