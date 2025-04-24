import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserLevel } from '../entities/user-level.entity';

@Injectable()
export class UserLevelRepository {
  constructor(
    @InjectRepository(UserLevel)
    private readonly userLevelRepository: Repository<UserLevel>,
  ) {}

  get repository(): Repository<UserLevel> {
    return this.userLevelRepository;
  }
}
