import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from '../features/topic/entities/topic.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { Activity, ActivityType, DifficultyLevel } from './entities/activity.entity';

@Injectable()
export class ActivitiesService {
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

  async findByType(type: ActivityType): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { type },
      relations: ['topic'],
    });
  }

  async findByDifficulty(level: DifficultyLevel): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { difficulty: level },
      relations: ['topic'],
    });
  }

  async findByTopic(topicId: string): Promise<Activity[]> {
    return this.activityRepository.find({
      where: { topic: { id: topicId } },
      relations: ['topic'],
    });
  }

  async getRandomActivity(): Promise<Activity> {
    const count = await this.activityRepository.count();
    const random = Math.floor(Math.random() * count);
    
    const activities = await this.activityRepository.find({
      where: {},
      relations: ['topic'],
      take: 1,
      skip: random,
    });

    return activities[0];
  }

  async validateAnswer(id: string, answer: any): Promise<{ correct: boolean; points: number }> {
    const activity = await this.findOne(id);
    
    switch (activity.type) {
      case ActivityType.VOCABULARY_QUIZ:
        const question = activity.content.questions[0];
        return {
          correct: question.correctAnswer === answer,
          points: activity.points,
        };
      
      case ActivityType.MEMORY_GAME:
        // Lógica para memory game
        break;
      case ActivityType.WORD_MATCHING:
        // Lógica para word matching
        break;
      case ActivityType.PRONUNCIATION_PRACTICE:
        // Lógica para pronunciation practice
        break;
      case ActivityType.CULTURAL_STORY:
        // Lógica para cultural story
        break;
      default:
        throw new Error('Activity type not supported for validation');
    }
  }

  async update(id: string, updateActivityDto: Partial<CreateActivityDto>): Promise<Activity> {
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
} 