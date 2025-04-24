import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserActivity } from '../entities/activity.entity';

@Injectable()
export class ActivityRepository extends Repository<UserActivity> {}
