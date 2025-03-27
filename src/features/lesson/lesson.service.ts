import { Injectable } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
  ) {}

  async findByUnidad(unityId: number): Promise<Lesson[]> {
    return this.lessonRepository.find({ where: { unity: { id: unityId } } });
  }

  async create(leccion: Lesson): Promise<Lesson> {
    return this.lessonRepository.save(leccion);
  }
}
