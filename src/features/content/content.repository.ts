import { Repository } from 'typeorm';
import { Content } from './entities/content.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ContentRepository extends Repository<Content> {
  constructor(
    @InjectRepository(Content)
    private repository: Repository<Content>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  // Aquí se pueden añadir métodos personalizados para consultas de contenido

  async createContent(content: Partial<Content>): Promise<Content> {
    const newContent = this.create(content);
    return this.save(newContent);
  }

  async findOneById(id: number): Promise<Content | undefined> {
    return this.findOne({ where: { id } });
  }

  async findByUnityAndTopic(unityId: string, topicId: string): Promise<Content[]> {
    return this.find({ where: { unityId, topicId }, order: { order: 'ASC' } });
  }

  async updateContent(id: number, content: Partial<Content>): Promise<Content | undefined> {
    await this.update(id, content);
    return this.findOneById(id);
  }

  async deleteContent(id: number): Promise<void> {
    await this.delete(id);
  }
}
