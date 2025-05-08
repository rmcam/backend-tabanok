import { Repository } from 'typeorm';
import { UserActivity } from '../entities/user-activity.entity';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class UserActivityRepository extends Repository<UserActivity> {
  constructor(private dataSource: DataSource) {
    super(UserActivity, dataSource.createEntityManager());
  }
}
