import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserLevel } from '../entities/user-level.entity';
import { User } from '../../../auth/entities/user.entity';

@Injectable()
export class UserLevelService {
  constructor(
    @InjectRepository(UserLevel)
    private readonly userLevelRepository: Repository<UserLevel>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Add methods here
}
