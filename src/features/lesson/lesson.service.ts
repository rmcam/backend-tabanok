import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Level } from '../level/entities/level.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { Lesson } from './entities/lesson.entity';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Level)
    private levelRepository: Repository<Level>,
  ) { }

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const { levelId, ...lessonData } = createLessonDto;

    const level = await this.levelRepository.findOne({
      where: { id: levelId }
    });

    if (!level) {
      throw new NotFoundException(`Nivel con ID ${levelId} no encontrado`);
    }

    const lesson = this.lessonRepository.create({
      ...lessonData,
      level
    });

    return this.lessonRepository.save(lesson);
  }

  async findAll(): Promise<Lesson[]> {
    return this.lessonRepository.find({
      relations: ['level', 'contents', 'exercises'],
      order: { order: 'ASC' }
    });
  }

  async findOne(id: number): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['level', 'contents', 'exercises']
    });

    if (!lesson) {
      throw new NotFoundException(`Lección con ID ${id} no encontrada`);
    }

    return lesson;
  }

  async update(id: number, updateLessonDto: Partial<CreateLessonDto>): Promise<Lesson> {
    const { levelId, ...lessonData } = updateLessonDto;

    const lesson = await this.findOne(id);

    if (levelId) {
      const level = await this.levelRepository.findOne({
        where: { id: levelId }
      });

      if (!level) {
        throw new NotFoundException(`Nivel con ID ${levelId} no encontrado`);
      }

      lesson.level = level;
    }

    Object.assign(lesson, lessonData);
    return this.lessonRepository.save(lesson);
  }

  async remove(id: number): Promise<void> {
    const lesson = await this.findOne(id);
    await this.lessonRepository.remove(lesson);
  }

  async findByOrder(order: number): Promise<Lesson[]> {
    return this.lessonRepository.find({
      where: { order },
      relations: ['level', 'contents', 'exercises'],
      order: { id: 'ASC' }
    });
  }

  async findByLevel(levelId: number): Promise<Lesson[]> {
    return this.lessonRepository.find({
      where: { level: { id: levelId } },
      relations: ['contents', 'exercises'],
      order: { order: 'ASC' }
    });
  }
}
