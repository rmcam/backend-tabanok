import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentVersioningService } from './content-versioning.service';
import { ContentVersion } from './entities/content-version.entity';
import { ChangeType, ContentStatus } from './interfaces/content-version.interface';

describe('ContentVersioningService', () => {
    let service: ContentVersioningService;
    let repository: Repository<ContentVersion>;

    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ContentVersioningService,
                {
                    provide: getRepositoryToken(ContentVersion),
                    useValue: mockRepository,
                },
            ],
        }).compile();

        service = module.get<ContentVersioningService>(ContentVersioningService);
        repository = module.get<Repository<ContentVersion>>(getRepositoryToken(ContentVersion));

        // Limpiar todos los mocks antes de cada prueba
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createVersion', () => {
        it('should create a new version', async () => {
            const contentId = 'test-content-id';
            const content = {
                original: 'Test content',
                translated: 'Contenido de prueba',
                culturalContext: 'Test context',
                pronunciation: 'Test pronunciation',
                dialectVariation: 'Test dialect'
            };
            const author = 'test-author';

            const expectedVersion = {
                contentId,
                content,
                status: ContentStatus.DRAFT,
                changeType: ChangeType.CREATION,
                metadata: {
                    author,
                    reviewers: [],
                    validatedBy: '',
                    createdAt: expect.any(Date),
                    modifiedAt: expect.any(Date),
                    comments: [],
                    tags: [],
                },
                validationStatus: {
                    culturalAccuracy: 0,
                    linguisticQuality: 0,
                    communityApproval: false,
                    isValidated: false,
                    score: 0,
                    dialectConsistency: 0,
                    feedback: []
                },
                changes: [],
                isLatest: true,
                hasConflicts: false,
                relatedVersions: []
            };

            mockRepository.find.mockResolvedValue([]);
            mockRepository.save.mockResolvedValue(expectedVersion);

            const result = await service.createVersion(contentId, content, author);

            expect(result).toEqual(expectedVersion);
            expect(mockRepository.save).toHaveBeenCalledWith(
                expect.objectContaining(expectedVersion)
            );
        });

        it('should handle version numbering when previous versions exist', async () => {
            const contentId = 'test-content-id';
            const content = { original: 'Test content' };
            const author = 'test-author';
            const previousVersion = {
                versionNumber: 1,
                id: 'prev-version-id'
            };

            mockRepository.find.mockResolvedValue([previousVersion]);
            mockRepository.save.mockImplementation(version => version);

            const result = await service.createVersion(contentId, content, author);

            expect(result.versionNumber).toBe(2);
            expect(result.previousVersion).toBe(previousVersion.id);
        });
    });

    describe('findOne', () => {
        it('should return a version by id', async () => {
            const mockVersion = new ContentVersion();
            mockRepository.findOne.mockResolvedValue(mockVersion);

            const result = await service.findOne('test-id');
            expect(result).toBe(mockVersion);
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'test-id' }
            });
        });

        it('should throw NotFoundException when version not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne('non-existent-id')).rejects.toThrow();
        });
    });

    describe('findByContentId', () => {
        it('should return versions for a content id', async () => {
            const mockVersions = [new ContentVersion(), new ContentVersion()];
            mockRepository.find.mockResolvedValue(mockVersions);

            const result = await service.findByContentId('test-content-id');
            expect(result).toBe(mockVersions);
            expect(mockRepository.find).toHaveBeenCalledWith({
                where: { contentId: 'test-content-id' },
                order: { versionNumber: 'DESC' }
            });
        });
    });

    describe('mergeVersions', () => {
        it('should merge two versions', async () => {
            const sourceVersion = new ContentVersion();
            const targetVersion = new ContentVersion();

            // Configurar sourceVersion
            Object.assign(sourceVersion, {
                id: 'source-id',
                contentId: 'test-content-id',
                metadata: {
                    author: 'test-author',
                    tags: [],
                    reviewers: [],
                    validatedBy: '',
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    comments: []
                },
                content: {
                    original: 'source content',
                    translated: 'contenido fuente',
                    culturalContext: '',
                    pronunciation: '',
                    dialectVariation: ''
                },
                changes: [],
                relatedVersions: [],
                changelog: []
            });

            // Configurar targetVersion
            Object.assign(targetVersion, {
                id: 'target-id',
                contentId: 'test-content-id',
                versionNumber: 1,
                metadata: {
                    author: 'test-author',
                    tags: [],
                    reviewers: [],
                    validatedBy: '',
                    createdAt: new Date(),
                    modifiedAt: new Date(),
                    comments: []
                },
                content: {
                    original: 'target content',
                    translated: 'contenido objetivo',
                    culturalContext: '',
                    pronunciation: '',
                    dialectVariation: ''
                },
                changes: [],
                relatedVersions: [],
                changelog: []
            });

            mockRepository.findOne
                .mockResolvedValueOnce(sourceVersion)
                .mockResolvedValueOnce(targetVersion);

            const mergedVersion = new ContentVersion();
            Object.assign(mergedVersion, {
                id: 'merged-id',
                contentId: targetVersion.contentId,
                versionNumber: targetVersion.versionNumber + 1,
                previousVersion: targetVersion.id,
                isLatest: true,
                content: {
                    ...targetVersion.content,
                    ...sourceVersion.content
                },
                metadata: {
                    ...targetVersion.metadata,
                    modifiedAt: expect.any(Date)
                },
                changes: [],
                relatedVersions: [sourceVersion.id],
                changelog: []
            });
            mockRepository.save.mockResolvedValue(mergedVersion);

            const result = await service.mergeVersions('source-id', 'target-id');

            expect(result).toBe(mergedVersion);
            expect(mockRepository.update).toHaveBeenCalledTimes(2);
            expect(mockRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    previousVersion: targetVersion.id,
                    isLatest: true,
                    content: expect.objectContaining({
                        original: expect.any(String)
                    })
                })
            );
        });

        it('should throw NotFoundException when source or target version not found', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.mergeVersions('source-id', 'target-id')).rejects.toThrow();
        });
    });
}); 