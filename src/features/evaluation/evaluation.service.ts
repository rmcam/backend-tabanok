import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CulturalContent } from '../cultural-content/cultural-content.entity';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { Evaluation } from './evaluation.entity';

@Injectable()
export class EvaluationService {
    constructor(
        @InjectRepository(Evaluation)
        private readonly evaluationRepository: Repository<Evaluation>,
        @InjectRepository(CulturalContent)
        private readonly culturalContentRepository: Repository<CulturalContent>,
    ) { }

    async create(createEvaluationDto: CreateEvaluationDto): Promise<Evaluation> {
        const culturalContent = await this.culturalContentRepository.findOne({
            where: { id: createEvaluationDto.culturalContentId }
        });

        if (!culturalContent) {
            throw new NotFoundException(`Contenido cultural con ID ${createEvaluationDto.culturalContentId} no encontrado`);
        }

        const evaluation = this.evaluationRepository.create({
            ...createEvaluationDto,
            culturalContent,
        });

        // Actualizar el número de intentos y promedio
        const previousEvaluations = await this.evaluationRepository.find({
            where: {
                userId: createEvaluationDto.userId,
                culturalContent: { id: createEvaluationDto.culturalContentId }
            }
        });

        evaluation.attemptsCount = previousEvaluations.length + 1;
        const totalScore = previousEvaluations.reduce((sum, ev) => sum + ev.score, 0) + evaluation.score;
        evaluation.averageScore = totalScore / evaluation.attemptsCount;

        return await this.evaluationRepository.save(evaluation);
    }

    async findAll(): Promise<Evaluation[]> {
        return await this.evaluationRepository.find({
            relations: ['culturalContent']
        });
    }

    async findByUserId(userId: string): Promise<Evaluation[]> {
        return await this.evaluationRepository.find({
            where: { userId },
            relations: ['culturalContent'],
            order: { createdAt: 'DESC' }
        });
    }

    async findUserProgress(userId: string): Promise<any> {
        const evaluations = await this.findByUserId(userId);

        const progress = {
            totalEvaluations: evaluations.length,
            averageScore: 0,
            totalTimeSpent: 0,
            progressByCategory: {},
            recentEvaluations: evaluations.slice(0, 5)
        };

        if (evaluations.length > 0) {
            progress.averageScore = evaluations.reduce((sum, ev) => sum + ev.score, 0) / evaluations.length;
            progress.totalTimeSpent = evaluations.reduce((sum, ev) => sum + ev.timeSpentSeconds, 0);

            // Agrupar progreso por categoría
            evaluations.forEach(ev => {
                const category = ev.culturalContent.category;
                if (!progress.progressByCategory[category]) {
                    progress.progressByCategory[category] = {
                        count: 0,
                        averageScore: 0,
                        evaluations: []
                    };
                }
                progress.progressByCategory[category].count++;
                progress.progressByCategory[category].evaluations.push(ev);
                progress.progressByCategory[category].averageScore =
                    progress.progressByCategory[category].evaluations.reduce((sum, e) => sum + e.score, 0) /
                    progress.progressByCategory[category].count;
            });
        }

        return progress;
    }

    async findOne(id: string): Promise<Evaluation> {
        const evaluation = await this.evaluationRepository.findOne({
            where: { id },
            relations: ['culturalContent']
        });

        if (!evaluation) {
            throw new NotFoundException(`Evaluación con ID ${id} no encontrada`);
        }

        return evaluation;
    }
} 