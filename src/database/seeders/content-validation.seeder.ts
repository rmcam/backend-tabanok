import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { ContentValidation } from '../../features/content-validation/entities/content-validation.entity';

export default class ContentValidationSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    // TODO: Implementar la lógica para poblar la entidad ContentValidation.
  }
}
