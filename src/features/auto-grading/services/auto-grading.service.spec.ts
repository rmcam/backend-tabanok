import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentVersion } from '../../content-versioning/entities/content-version.entity';
import { AutoGradingService } from './auto-grading.service';

describe('AutoGradingService', () => {
    let service: AutoGradingService;
    let repository: Repository<ContentVersion>;

    const mockVersion: ContentVersion = {
        id: '1',
        content: {
            original: 'Texto original de prueba',
            translated: 'Test translation text',
            culturalContext: 'Contexto cultural de prueba que explica el significado',
            pronunciation: 'Pronunciación de prueba',
            dialectVariation: 'Dialecto de prueba'
        },
        metadata: {
            tags: ['test', 'prueba']
        }
    } as ContentVersion;

    const mockPreviousVersion: ContentVersion = {
        id: '2',
        content: {
            original: 'Texto original anterior',
            translated: 'Previous translation text',
            culturalContext: 'Contexto cultural anterior',
            pronunciation: 'Pronunciación anterior',
            dialectVariation: 'Dialecto de prueba'
        }
    } as ContentVersion;

    const mockRepository = {
        findOne: jest.fn(),
        createQueryBuilder: jest.fn(() => ({
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            getMany: jest.fn().mockResolvedValue([mockPreviousVersion])
        }))
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AutoGradingService,
                {
                    provide: getRepositoryToken(ContentVersion),
                    useValue: mockRepository
                }
            ]
        }).compile();

        service = module.get<AutoGradingService>(AutoGradingService);
        repository = module.get<Repository<ContentVersion>>(getRepositoryToken(ContentVersion));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('gradeContent', () => {
        it('should return a complete grading result', async () => {
            mockRepository.findOne.mockResolvedValueOnce(mockPreviousVersion);

            const result = await service.gradeContent(mockVersion);

            expect(result).toHaveProperty('score');
            expect(result).toHaveProperty('breakdown');
            expect(result).toHaveProperty('feedback');
            expect(result).toHaveProperty('suggestions');
            expect(result).toHaveProperty('confidence');
            expect(result.score).toBeGreaterThanOrEqual(0);
            expect(result.score).toBeLessThanOrEqual(1);
        });

        it('should evaluate completeness correctly', async () => {
            mockRepository.findOne.mockResolvedValueOnce(mockPreviousVersion);

            const result = await service.gradeContent(mockVersion);

            expect(result.breakdown.completeness).toBeGreaterThan(0.8);
        });

        it('should generate appropriate feedback for low scores', async () => {
            const incompleteVersion: ContentVersion = {
                id: '3',
                content: {
                    original: 'Texto corto',
                    translated: '',
                    culturalContext: '',
                    pronunciation: '',
                    dialectVariation: ''
                }
            } as ContentVersion;

            const result = await service.gradeContent(incompleteVersion);

            expect(result.feedback.length).toBeGreaterThan(0);
            expect(result.suggestions.length).toBeGreaterThan(0);
            expect(result.score).toBeLessThan(0.7);
        });

        it('should calculate confidence based on criteria consistency', async () => {
            mockRepository.findOne.mockResolvedValueOnce(mockPreviousVersion);

            const result = await service.gradeContent(mockVersion);

            expect(result.confidence).toBeGreaterThanOrEqual(0);
            expect(result.confidence).toBeLessThanOrEqual(1);
        });
    });

    describe('evaluateDialectConsistency', () => {
        it('should evaluate dialect patterns with similar content', async () => {
            mockRepository.findOne.mockResolvedValueOnce(mockPreviousVersion);

            const result = await service.gradeContent(mockVersion);

            expect(result.breakdown.dialectConsistency).toBeGreaterThan(0);
            expect(mockRepository.createQueryBuilder).toHaveBeenCalled();
        });
    });
}); 