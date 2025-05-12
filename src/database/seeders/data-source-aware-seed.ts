import { DataSource } from 'typeorm';

export abstract class DataSourceAwareSeed {
  constructor(protected dataSource: DataSource) {}

  abstract run(): Promise<void>;
}
