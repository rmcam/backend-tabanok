import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Statistics } from '../entities/statistics.entity';

@Injectable()
export class StatisticsRepository extends Repository<Statistics> {
  constructor(private dataSource: DataSource) {
    super(Statistics, dataSource.createEntityManager());
  }
}
