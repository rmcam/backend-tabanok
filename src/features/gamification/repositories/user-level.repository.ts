import { Repository } from 'typeorm';
import { UserLevel } from '../entities/user-level.entity';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class UserLevelRepository extends Repository<UserLevel> {
  constructor(private dataSource: DataSource) {
    super(UserLevel, dataSource.createEntityManager());
  }
}
