import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentVersion as ContentVersionEntity } from '../../content-versioning/entities/content-version.entity'; // Renamed to avoid conflict
import {
    ChangeType,
    ContentStatus,
    ValidationStatus,
    ContentData,
    VersionMetadata,
    ChangelogEntry,
    ContentDiff,
    ContentVersion // Use the interface for mocks
} from '../../content-versioning/interfaces/content-version.interface';
import { AutoGradingService } from './auto-grading.service';

describe('AutoGradingService', () => {
    let service: AutoGradingService;
    let repository: Repository<ContentVersionEntity>; // Use the entity type here

    // Define mock ValidationStatus objects
    const mockValidationStatus: ValidationStatus = {
        culturalAccuracy: 0.9,
        linguisticQuality: 0.85,
        communityApproval: true,
        isValidated: true,
        score: 0.88,
        dialectConsistency: 0.92,
        feedback: ['Buen trabajo inicial']
    };

    const mockPreviousValidationStatus: ValidationStatus = {
        culturalAccuracy: 0.8,
        linguisticQuality: 0.8,
        communityApproval: true,
        isValidated: true,
        score: 0.82,
        dialectConsistency: 0.85,
        feedback: []
    };

    // Define mock Metadata objects
    const mockMetadata: VersionMetadata = {
        tags: ['test', 'prueba'],
        author: 'user-1', // Moved authorId here
        reviewers: ['reviewer-1'],
        validatedBy: 'validator-1'
        // Add other required fields if any from VersionMetadata interface
    };

    const mockPreviousMetadata: VersionMetadata = {
        tags: ['test', 'anterior'],
        author: 'user-2', // Moved authorId here
        reviewers: ['reviewer-1'],
        validatedBy: 'validator-1'
        // Add other required fields if any
    };

    // Define mock ContentData objects
    const mockContentData: ContentData = {
        original: 'Texto original de prueba',
        translated: 'Test translation text',
        culturalContext: 'Contexto cultural de prueba que explica el significado',
        pronunciation: 'Pronunciación de prueba',
        dialectVariation: 'Dialecto de prueba'
    };

    const mockPreviousContentData: ContentData = {
        original: 'Texto original anterior',
        translated: 'Previous translation text',
        culturalContext: 'Contexto cultural anterior',
        pronunciation: 'Pronunciación anterior',
        dialectVariation: 'Dialecto de prueba'
    };

    const mockVersion: ContentVersion = {
        id: '1',
        contentId: 'content-1',
        versionNumber: 1,
        majorVersion: 1,
        minorVersion: 0,
        patchVersion: 0, // Added required field
        status: ContentStatus.PUBLISHED, // Use enum
        changeType: ChangeType.MODIFICATION, // Use enum
        changes: [] as ContentDiff[], // Added required field with type
        metadata: mockMetadata, // Use defined metadata object
        content: mockContentData, // Use defined content object
        validationStatus: mockValidationStatus, // Use defined validation status object
        isLatest: true, // Use correct property name
        hasConflicts: false,
        relatedVersions: [],
        changelog: [] as ChangelogEntry[], // Added required field with type
        createdAt: new Date(),
        updatedAt: new Date(),
        // Removed isPublished, isLatestVersion, authorId
    };

    const mockPreviousVersion: ContentVersion = {
        id: '2',
        contentId: 'content-2', // Corrected contentId
        versionNumber: 0, // Corrected version number logic (assuming this is v0)
        majorVersion: 0,
        minorVersion: 1, // Example versioning
        patchVersion: 0, // Added required field
        status: ContentStatus.PUBLISHED, // Use enum
        changeType: ChangeType.CREATION, // Example: Previous was creation
        changes: [] as ContentDiff[], // Added required field with type
        metadata: mockPreviousMetadata, // Use defined metadata object
        content: mockPreviousContentData, // Use defined content object
        validationStatus: mockPreviousValidationStatus, // Use defined validation status object
        isLatest: false, // Use correct property name
        hasConflicts: false,
        relatedVersions: ['1'], // Example relation
        changelog: [] as ChangelogEntry[], // Added required field with type
        createdAt: new Date(Date.now() - 86400000), // Example: Created yesterday
        updatedAt: new Date(Date.now() - 86400000),
        // Removed isPublished, isLatestVersion, authorId
    };

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
                    provide: getRepositoryToken(ContentVersionEntity), // Use the Entity class here
                    useValue: mockRepository
                }
            ]
        }).compile();

        service = module.get<AutoGradingService>(AutoGradingService);
        repository = module.get<Repository<ContentVersionEntity>>(getRepositoryToken(ContentVersionEntity)); // Use Entity type token
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
            // No need to mock findOne here if gradeContent doesn't use previous version for completeness
            // mockRepository.findOne.mockResolvedValueOnce(mockPreviousVersion);

            const result = await service.gradeContent(mockVersion); // Use the well-defined mockVersion

            expect(result.breakdown.completeness).toBeGreaterThan(0.8); // Adjust threshold as needed
        });

        it('should generate appropriate feedback for low scores', async () => {
             // Define a truly incomplete version based on the interface
            const incompleteValidationStatus: ValidationStatus = {
                culturalAccuracy: 0.1, linguisticQuality: 0.1, communityApproval: false, isValidated: false, score: 0.1, dialectConsistency: 0.1, feedback: []
            };
            const incompleteMetadata: VersionMetadata = { tags: [], author: 'user-3', reviewers: [], validatedBy: '' };
            const incompleteContent: ContentData = { original: 'Texto corto', translated: '', culturalContext: '', pronunciation: '', dialectVariation: '' };

            const incompleteVersion: ContentVersion = {
                id: '3',
                contentId: 'content-3',
                versionNumber: 1,
                majorVersion: 1,
                minorVersion: 0,
                patchVersion: 0,
                status: ContentStatus.DRAFT, // More appropriate status
                changeType: ChangeType.CREATION,
                changes: [],
                metadata: incompleteMetadata,
                content: incompleteContent,
                validationStatus: incompleteValidationStatus, // Low scores
                isLatest: true,
                hasConflicts: false,
                relatedVersions: [],
                changelog: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
             // No need to mock findOne if gradeContent doesn't need previous version for incomplete check
            // mockRepository.findOne.mockResolvedValueOnce(null); // Example: No previous version

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
