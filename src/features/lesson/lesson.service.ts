import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Level } from '../level/entities/level.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from './entities/lesson.entity';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Level)
    private readonly levelRepository: Repository<Level>,
  ) { }

  async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const level = await this.levelRepository.findOneBy({
      id: createLessonDto.levelId,
    });

    if (!level) {
      throw new NotFoundException(`Nivel con ID ${createLessonDto.levelId} no encontrado`);
    }

    const lesson = new Lesson();
    Object.assign(lesson, createLessonDto);

    // Si no se especifica un orden, obtener el último orden y agregar 1
    if (!lesson.order) {
      const maxOrder = await this.getMaxOrder(lesson.levelId);
      lesson.order = maxOrder + 1;
    }

    return this.lessonRepository.save(lesson);
  }

  async findAll(): Promise<Lesson[]> {
    return this.lessonRepository.find({
      relations: ['level', 'contents', 'exercises'],
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['level', 'contents', 'exercises'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lección con ID ${id} no encontrada`);
    }

    return lesson;
  }

  async findByLevel(levelId: string): Promise<Lesson[]> {
    return this.lessonRepository.find({
      where: { levelId },
      relations: ['level', 'contents', 'exercises'],
      order: { order: 'ASC' },
    });
  }

  async update(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.findOne(id);

    if (updateLessonDto.levelId) {
      const level = await this.levelRepository.findOneBy({
        id: updateLessonDto.levelId,
      });

      if (!level) {
        throw new NotFoundException(`Nivel con ID ${updateLessonDto.levelId} no encontrado`);
      }
    }

    Object.assign(lesson, updateLessonDto);
    return this.lessonRepository.save(lesson);
  }

  async remove(id: string): Promise<void> {
    const lesson = await this.findOne(id);
    await this.lessonRepository.remove(lesson);
  }

  async toggleLock(id: string): Promise<Lesson> {
    const lesson = await this.findOne(id);
    lesson.isLocked = !lesson.isLocked;
    return this.lessonRepository.save(lesson);
  }

  async updatePoints(id: string, points: number): Promise<Lesson> {
    const lesson = await this.findOne(id);
    lesson.requiredPoints = points;
    return this.lessonRepository.save(lesson);
  }

  private async getMaxOrder(levelId: string): Promise<number> {
    const result = await this.lessonRepository
      .createQueryBuilder('lesson')
      .where('lesson.levelId = :levelId', { levelId })
      .select('MAX(lesson.order)', 'maxOrder')
      .getRawOne();

    return result.maxOrder || 0;
  }
}
