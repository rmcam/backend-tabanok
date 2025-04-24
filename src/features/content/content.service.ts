import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { Content } from './entities/content.entity';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
  ) {}

  async create(createContentDto: CreateContentDto): Promise<Content> {
    const content = this.contentRepository.create(createContentDto);
    return await this.contentRepository.save(content);
  }

  async findAll(): Promise<Content[]> {
    return await this.contentRepository.find({
      where: { isActive: true },
      relations: ['lesson'],
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Content> {
    const content = await this.contentRepository.findOne({
      where: { id, isActive: true },
      relations: ['lesson'],
    });

    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }

    return content;
  }

  async findByLesson(lessonId: string): Promise<Content[]> {
    return await this.contentRepository.find({
      where: { lessonId, isActive: true },
      relations: ['lesson'],
      order: { order: 'ASC' },
    });
  }

  async update(id: string, updateContentDto: UpdateContentDto): Promise<Content> {
    const content = await this.findOne(id);
    Object.assign(content, updateContentDto);
    return await this.contentRepository.save(content);
  }

  async remove(id: string): Promise<void> {
    const content = await this.findOne(id);
    content.isActive = false;
    await this.contentRepository.save(content);
  }

  async searchContent(query: string): Promise<Content[]> {
    return await this.contentRepository.find({
      where: {
        title: ILike(`%${query}%`),
        isActive: true,
      },
      relations: ['lesson'],
      order: { order: 'ASC' },
    });
  }
}
