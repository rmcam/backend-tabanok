import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentValidation } from './entities/content-validation.entity';
import { ContentType, ValidationFeedback, ValidationStatus } from './interfaces/content-validation.interface';

@Injectable()
export class ContentValidationService {
    constructor(
        @InjectRepository(ContentValidation)
        private validationRepository: Repository<ContentValidation>
    ) { }

    async submitForValidation(
        contentId: string,
        contentType: ContentType,
        originalContent: string,
        translatedContent: string,
        submittedBy: string,
        culturalContext?: string,
        dialectVariation?: string
    ): Promise<ContentValidation> {
        const validation = this.validationRepository.create({
            contentId,
            contentType,
            originalContent,
            translatedContent,
            submittedBy,
            culturalContext,
            dialectVariation,
            status: ValidationStatus.PENDING,
            criteria: {
                spelling: false,
                grammar: false,
                culturalAccuracy: false,
                contextualUse: false,
                pronunciation: false
            },
            communityVotes: {
                upvotes: 0,
                downvotes: 0,
                userVotes: {}
            },
            metadata: {
                reviewCount: 0,
                lastReviewDate: null,
                averageReviewTime: 0,
                validationHistory: []
            }
        });

        return this.validationRepository.save(validation);
    }

    async validateContent(
        validationId: string,
        validatorId: string,
        criteria: {
            spelling: boolean;
            grammar: boolean;
            culturalAccuracy: boolean;
            contextualUse: boolean;
            pronunciation: boolean;
        },
        feedback: Omit<ValidationFeedback, 'timestamp' | 'validatorId'>
    ): Promise<ContentValidation> {
        const validation = await this.validationRepository.findOne({ where: { id: validationId } });

        if (!validation) {
            throw new NotFoundException(`Validación con ID ${validationId} no encontrada`);
        }

        if (validation.validatedBy.includes(validatorId)) {
            throw new BadRequestException('Este contenido ya ha sido validado por este usuario');
        }

        // Actualizar criterios de validación
        validation.criteria = {
            ...validation.criteria,
            ...criteria
        };

        // Agregar feedback
        validation.feedback.push({
            ...feedback,
            timestamp: new Date(),
            validatorId
        });

        // Actualizar lista de validadores
        validation.validatedBy.push(validatorId);

        // Calcular puntuación de validación
        validation.validationScore = this.calculateValidationScore(validation);

        // Actualizar estado basado en la puntuación
        validation.status = this.determineValidationStatus(validation);

        // Actualizar metadata
        const reviewTime = new Date().getTime() - new Date(validation.submissionDate).getTime();
        validation.metadata = {
            ...validation.metadata,
            reviewCount: validation.metadata.reviewCount + 1,
            lastReviewDate: new Date(),
            averageReviewTime: (validation.metadata.averageReviewTime * validation.metadata.reviewCount + reviewTime) / (validation.metadata.reviewCount + 1),
            validationHistory: [
                ...validation.metadata.validationHistory,
                {
                    status: validation.status,
                    timestamp: new Date(),
                    validatorId
                }
            ]
        };

        return this.validationRepository.save(validation);
    }

    async addCommunityVote(
        validationId: string,
        userId: string,
        isUpvote: boolean
    ): Promise<ContentValidation> {
        const validation = await this.validationRepository.findOne({ where: { id: validationId } });

        if (!validation) {
            throw new NotFoundException(`Validación con ID ${validationId} no encontrada`);
        }

        const previousVote = validation.communityVotes.userVotes[userId];

        // Revertir voto anterior si existe
        if (previousVote !== undefined) {
            if (previousVote) {
                validation.communityVotes.upvotes--;
            } else {
                validation.communityVotes.downvotes--;
            }
        }

        // Aplicar nuevo voto
        if (isUpvote) {
            validation.communityVotes.upvotes++;
        } else {
            validation.communityVotes.downvotes++;
        }

        validation.communityVotes.userVotes[userId] = isUpvote;

        // Recalcular puntuación considerando votos de la comunidad
        validation.validationScore = this.calculateValidationScore(validation);

        return this.validationRepository.save(validation);
    }

    async addUsageExample(
        validationId: string,
        example: string
    ): Promise<ContentValidation> {
        const validation = await this.validationRepository.findOne({ where: { id: validationId } });

        if (!validation) {
            throw new NotFoundException(`Validación con ID ${validationId} no encontrada`);
        }

        if (!validation.usageExamples) {
            validation.usageExamples = [];
        }

        validation.usageExamples.push(example);
        return this.validationRepository.save(validation);
    }

    async updateAudioReference(
        validationId: string,
        audioUrl: string
    ): Promise<ContentValidation> {
        const validation = await this.validationRepository.findOne({ where: { id: validationId } });

        if (!validation) {
            throw new NotFoundException(`Validación con ID ${validationId} no encontrada`);
        }

        validation.audioReference = audioUrl;
        return this.validationRepository.save(validation);
    }

    async findPendingValidations(): Promise<ContentValidation[]> {
        return this.validationRepository.find({
            where: { status: ValidationStatus.PENDING },
            order: {
                isUrgent: 'DESC',
                submissionDate: 'ASC'
            }
        });
    }

    async findValidationsByContent(contentId: string): Promise<ContentValidation[]> {
        return this.validationRepository.find({
            where: { contentId },
            order: { submissionDate: 'DESC' }
        });
    }

    private calculateValidationScore(validation: ContentValidation): number {
        const criteriaWeight = 0.6;
        const feedbackWeight = 0.2;
        const communityWeight = 0.2;

        // Puntuación basada en criterios cumplidos
        const criteriaScore = Object.values(validation.criteria)
            .filter(Boolean).length / Object.values(validation.criteria).length;

        // Puntuación basada en cantidad de feedback
        const feedbackScore = Math.min(validation.feedback.length / 3, 1);

        // Puntuación basada en votos de la comunidad
        const totalVotes = validation.communityVotes.upvotes + validation.communityVotes.downvotes;
        const communityScore = totalVotes === 0 ? 0.5 :
            validation.communityVotes.upvotes / totalVotes;

        return (
            criteriaScore * criteriaWeight +
            feedbackScore * feedbackWeight +
            communityScore * communityWeight
        ) * 100;
    }

    private determineValidationStatus(validation: ContentValidation): ValidationStatus {
        const minimumValidators = 2;
        const minimumScore = 70;

        if (validation.validatedBy.length < minimumValidators) {
            return ValidationStatus.PENDING;
        }

        if (validation.validationScore >= minimumScore) {
            return ValidationStatus.APPROVED;
        }

        if (validation.validationScore < 50) {
            return ValidationStatus.REJECTED;
        }

        return ValidationStatus.NEEDS_REVIEW;
    }

    async getValidationStatistics(): Promise<any> {
        const validations = await this.validationRepository.find();

        return {
            total: validations.length,
            byStatus: {
                pending: validations.filter(v => v.status === ValidationStatus.PENDING).length,
                approved: validations.filter(v => v.status === ValidationStatus.APPROVED).length,
                rejected: validations.filter(v => v.status === ValidationStatus.REJECTED).length,
                needsReview: validations.filter(v => v.status === ValidationStatus.NEEDS_REVIEW).length
            },
            byType: Object.values(ContentType).reduce((acc, type) => ({
                ...acc,
                [type]: validations.filter(v => v.contentType === type).length
            }), {}),
            averageValidationTime: this.calculateAverageValidationTime(validations),
            communityParticipation: this.calculateCommunityParticipation(validations)
        };
    }

    private calculateAverageValidationTime(validations: ContentValidation[]): number {
        const completedValidations = validations.filter(v => v.status !== ValidationStatus.PENDING);
        if (completedValidations.length === 0) return 0;

        const totalTime = completedValidations.reduce((sum, validation) => {
            return sum + validation.metadata.averageReviewTime;
        }, 0);

        return totalTime / completedValidations.length;
    }

    private calculateCommunityParticipation(validations: ContentValidation[]): any {
        const totalVotes = validations.reduce((sum, validation) => {
            return sum + validation.communityVotes.upvotes + validation.communityVotes.downvotes;
        }, 0);

        const uniqueValidators = new Set(
            validations.flatMap(v => v.validatedBy)
        ).size;

        return {
            totalVotes,
            uniqueValidators,
            averageVotesPerContent: totalVotes / validations.length
        };
    }
} 