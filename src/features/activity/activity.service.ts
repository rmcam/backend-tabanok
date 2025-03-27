import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from '../topic/entities/topic.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { Activity, ActivityType, DifficultyLevel } from './entities/activity.entity';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
  ) {}

  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    const topic = await this.topicRepository.findOne({
      where: { id: createActivityDto.topicId },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${createActivityDto.topicId} not found`);
    }

    const activity = this.activityRepository.create({
      ...createActivityDto,
      topic,
    });

    return this.activityRepository.save(activity);
  }

  async findAll(): Promise<Activity[]> {
    return this.activityRepository.find({
      relations: ['topic'],
    });
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activityRepository.findOne({
      where: { id },
      relations: ['topic'],
    });

    if (!activity) {
      throw new NotFoundException(`Activity with ID ${id} not found`);
    }

    return activity;
  }

  async findByTopic(topicId: string): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { topic: { id: topicId } },
      relations: ['topic'],
    });
  }

  async findByType(type: ActivityType): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { type },
      relations: ['topic'],
    });
  }

  async findByDifficultyLevel(level: DifficultyLevel): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { difficultyLevel: level },
      relations: ['topic'],
    });
  }

  async getRandomActivities(limit: number = 5): Promise<Activity[]> {
    return this.activityRepository
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.topic', 'topic')
      .orderBy('RANDOM()')
      .take(limit)
      .getMany();
  }

  async update(id: string, updateActivityDto: UpdateActivityDto): Promise<Activity> {
    const activity = await this.findOne(id);

    if (updateActivityDto.topicId) {
      const topic = await this.topicRepository.findOne({
        where: { id: updateActivityDto.topicId },
      });

      if (!topic) {
        throw new NotFoundException(`Topic with ID ${updateActivityDto.topicId} not found`);
      }

      activity.topic = topic;
    }

    Object.assign(activity, updateActivityDto);
    return this.activityRepository.save(activity);
  }

  async remove(id: string): Promise<void> {
    const activity = await this.findOne(id);
    await this.activityRepository.remove(activity);
  }

  async validateAnswer(
    activityId: string,
    questionIndex: number,
    answer: string,
  ): Promise<{
    correct: boolean;
    points: number;
    correctAnswer?: string;
  }> {
    const activity = await this.findOne(activityId);

    if (activity.type !== ActivityType.VOCABULARY_QUIZ) {
      throw new Error('This activity type does not support answer validation');
    }

    const question = activity.content.questions?.[questionIndex];
    if (!question) {
      throw new Error('Question not found');
    }

    const isCorrect = question.correctAnswer.toLowerCase() === answer.toLowerCase();

    return {
      correct: isCorrect,
      points: isCorrect ? question.points : 0,
      correctAnswer: isCorrect ? undefined : question.correctAnswer,
    };
  }
}
