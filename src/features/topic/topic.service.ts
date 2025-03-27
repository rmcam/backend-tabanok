import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Topic } from './entities/topic.entity';

@Injectable()
export class TopicService {
    constructor(
        @InjectRepository(Topic)
        private readonly topicRepository: Repository<Topic>,
    ) { }

    async create(createTopicDto: CreateTopicDto): Promise<Topic> {
        const topic = this.topicRepository.create(createTopicDto);
        return await this.topicRepository.save(topic);
    }

    async findAll(): Promise<Topic[]> {
        return await this.topicRepository.find({
            where: { isActive: true },
            relations: ['vocabulary', 'lessons'],
            order: { order: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Topic> {
        const topic = await this.topicRepository.findOne({
            where: { id, isActive: true },
            relations: ['vocabulary', 'lessons'],
        });

        if (!topic) {
            throw new NotFoundException(`Topic with ID ${id} not found`);
        }

        return topic;
    }

    async update(id: string, updateTopicDto: UpdateTopicDto): Promise<Topic> {
        const topic = await this.findOne(id);
        Object.assign(topic, updateTopicDto);
        return await this.topicRepository.save(topic);
    }

    async remove(id: string): Promise<void> {
        const topic = await this.findOne(id);
        topic.isActive = false;
        await this.topicRepository.save(topic);
    }
} 