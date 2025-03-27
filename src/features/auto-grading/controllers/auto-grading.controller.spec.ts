import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ContentVersion } from '../../content-versioning/entities/content-version.entity';
import { AutoGradingService } from '../services/auto-grading.service';
import { AutoGradingController } from './auto-grading.controller';

describe('AutoGradingController', () => {
    let controller: AutoGradingController;
    let service: AutoGradingService;

    const mockVersion: ContentVersion = {
        id: '1',
        content: {
            original: 'Texto original de prueba',
            translated: 'Test translation text',
            culturalContext: 'Contexto cultural de prueba',
            pronunciation: 'Pronunciación de prueba',
            dialectVariation: 'Dialecto de prueba'
        }
    } as ContentVersion;

    const mockGradingResult = {
        score: 0.85,
        breakdown: {
            completeness: 0.9,
            accuracy: 0.85,
            culturalRelevance: 0.8,
            dialectConsistency: 0.85,
            contextQuality: 0.85
        },
        feedback: ['Buen trabajo general'],
        suggestions: ['Considerar agregar más contexto cultural'],
        confidence: 0.9
    };

    const mockRepository = {
        findOne: jest.fn()
    };

    const mockService = {
        gradeContent: jest.fn(),
        WEIGHTS: {
            completeness: 0.2,
            accuracy: 0.25,
            culturalRelevance: 0.25,
            dialectConsistency: 0.2,
            contextQuality: 0.1
        }
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AutoGradingController],
            providers: [
                {
                    provide: AutoGradingService,
                    useValue: mockService
                },
                {
                    provide: getRepositoryToken(ContentVersion),
                    useValue: mockRepository
                }
            ]
        }).compile();

        controller = module.get<AutoGradingController>(AutoGradingController);
        service = module.get<AutoGradingService>(AutoGradingService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('gradeContent', () => {
        it('should return grading result for valid version ID', async () => {
            mockRepository.findOne.mockResolvedValueOnce(mockVersion);
            mockService.gradeContent.mockResolvedValueOnce(mockGradingResult);

            const result = await controller.gradeContent('1');

            expect(result).toEqual(mockGradingResult);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: '1' }
            });
            expect(mockService.gradeContent).toHaveBeenCalledWith(mockVersion);
        });

        it('should throw NotFoundException for invalid version ID', async () => {
            mockRepository.findOne.mockResolvedValueOnce(null);

            await expect(controller.gradeContent('999')).rejects.toThrow(NotFoundException);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: '999' }
            });
        });
    });

    describe('getCriteria', () => {
        it('should return grading criteria information', () => {
            const criteria = controller.getCriteria();

            expect(criteria).toHaveProperty('weights');
            expect(criteria).toHaveProperty('thresholds');
            expect(criteria).toHaveProperty('description');
            expect(criteria.weights).toEqual(mockService.WEIGHTS);
        });

        it('should include all required threshold values', () => {
            const criteria = controller.getCriteria();

            expect(criteria.thresholds).toHaveProperty('minimum');
            expect(criteria.thresholds).toHaveProperty('good');
            expect(criteria.thresholds).toHaveProperty('excellent');
        });

        it('should include descriptions for all criteria', () => {
            const criteria = controller.getCriteria();

            expect(criteria.description).toHaveProperty('completeness');
            expect(criteria.description).toHaveProperty('accuracy');
            expect(criteria.description).toHaveProperty('culturalRelevance');
            expect(criteria.description).toHaveProperty('dialectConsistency');
            expect(criteria.description).toHaveProperty('contextQuality');
        });
    });
}); 