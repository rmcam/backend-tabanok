import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GamificationService } from '../../gamification/services/gamification.service';
import { CreateStatisticsDto } from '../dto/create-statistics.dto';
import { GenerateReportDto } from '../dto/statistics-report.dto';
import { Statistics } from '../entities/statistics.entity';
import { StatisticsReportService } from './statistics-report.service';

@Injectable()
export class StatisticsService {
    constructor(
        @InjectRepository(Statistics)
        private readonly statisticsRepository: Repository<Statistics>,
        private readonly gamificationService: GamificationService,
        private readonly reportService: StatisticsReportService
    ) { }

    async create(createStatisticsDto: CreateStatisticsDto): Promise<Statistics> {
        const statistics = this.statisticsRepository.create(createStatisticsDto);
        return this.statisticsRepository.save(statistics);
    }

    async findAll(): Promise<Statistics[]> {
        return this.statisticsRepository.find();
    }

    async findOne(id: string): Promise<Statistics> {
        const statistics = await this.statisticsRepository.findOne({ where: { id } });
        if (!statistics) {
            throw new NotFoundException(`Statistics with ID ${id} not found`);
        }
        return statistics;
    }

    async findByUserId(userId: string): Promise<Statistics> {
        const statistics = await this.statisticsRepository.findOne({ where: { userId } });
        if (!statistics) {
            throw new NotFoundException(`Statistics for user ${userId} not found`);
        }
        return statistics;
    }

    async generateReport(generateReportDto: GenerateReportDto): Promise<any> {
        const statistics = await this.findByUserId(generateReportDto.userId);
        return this.reportService.generateReport(statistics, generateReportDto);
    }
} 