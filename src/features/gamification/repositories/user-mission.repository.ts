import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserMission } from '../entities/user-mission.entity';

@Injectable()
export class UserMissionRepository {
  constructor(
    @InjectRepository(UserMission)
    private readonly userMissionRepository: Repository<UserMission>,
  ) {}
}
