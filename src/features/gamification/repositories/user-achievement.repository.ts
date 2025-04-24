import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserAchievement } from '../entities/user-achievement.entity';

@Injectable()
export class UserAchievementRepository extends Repository<UserAchievement> {
  constructor(private dataSource: DataSource) {
    super(UserAchievement, dataSource.createEntityManager());
  }
}
