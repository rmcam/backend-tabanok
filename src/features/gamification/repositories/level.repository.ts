import { Injectable, Inject } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { UserLevel } from '../entities/user-level.entity';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class LevelRepository extends Repository<UserLevel> {
  constructor(@InjectDataSource() dataSource: DataSource) {
    super(UserLevel, dataSource.manager);
  }
}
