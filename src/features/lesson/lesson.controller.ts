import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from './entities/lesson.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('lesson')
@ApiBearerAuth()
@Controller('lesson')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}
  @Get('unity/:unityId')
  async findByUnidad(@Param('unityId') unityId: number): Promise<Lesson[]> {
    return this.lessonService.findByUnidad(unityId);
  }

  @Post()
  async create(@Body() lesson: Lesson): Promise<Lesson> {
    return this.lessonService.create(lesson);
  }
  
}
