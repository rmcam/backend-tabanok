import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MissionTemplate } from '../entities/mission-template.entity';

@Injectable()
export class MissionTemplateService {
  constructor(
    @InjectRepository(MissionTemplate)
    private readonly missionTemplateRepository: Repository<MissionTemplate>,
  ) {}

  async create(data: Partial<MissionTemplate>): Promise<MissionTemplate> {
    const template = this.missionTemplateRepository.create(data);
    return this.missionTemplateRepository.save(template);
  }

  async findAll(): Promise<MissionTemplate[]> {
    return this.missionTemplateRepository.find();
  }

  async findOne(id: string): Promise<MissionTemplate> {
    const template = await this.missionTemplateRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException(`MissionTemplate with id ${id} not found`);
    }
    return template;
  }

  async update(id: string, data: Partial<MissionTemplate>): Promise<MissionTemplate> {
    const template = await this.findOne(id);
    Object.assign(template, data);
    return this.missionTemplateRepository.save(template);
  }

  async remove(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.missionTemplateRepository.remove(template);
  }
}
