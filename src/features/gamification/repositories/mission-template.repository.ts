import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MissionTemplate } from '../entities/mission-template.entity';

@Injectable()
export class MissionTemplateRepository {
  constructor(
    @InjectRepository(MissionTemplate)
    private readonly missionTemplateRepository: Repository<MissionTemplate>,
  ) {}
}
