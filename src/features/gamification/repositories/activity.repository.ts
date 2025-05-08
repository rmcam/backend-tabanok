import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserActivity } from '../../activity/entities/user-activity.entity'; // Corregir ruta de importación

@Injectable()
export class ActivityRepository extends Repository<UserActivity> {}
