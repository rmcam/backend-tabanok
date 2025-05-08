import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Status } from "../../../common/enums/status.enum";
// import { ContentVersion } from "../../../features/content-versioning/interfaces/content-version.interface"; // Eliminar esta importación
import { ContentVersion as ContentVersionEntity } from "../../content-versioning/entities/content-version.entity";
import { ChangeType } from "../../content-versioning/enums/change-type.enum";
import { AutoGradingService } from "./auto-grading.service";
import { DictionaryService } from "../../../features/dictionary/dictionary.service"; // Import DictionaryService

// Definir interfaces locales necesarias para los mocks
interface ContentData {
  original: string;
  translated: string;
  culturalContext: string;
  pronunciation: string;
  dialectVariation: string;
}

interface VersionMetadata {
  tags: string[];
  author: string;
  reviewers: string[];
  validatedBy: string;
  previousVersionId?: string; // Add optional previousVersionId
}

interface ValidationStatus {
  culturalAccuracy: number;
  linguisticQuality: number;
  communityApproval: boolean;
  isValidated: boolean;
  score: number;
  dialectConsistency: number;
  feedback: string[];
}

// Mock de la entidad Content para usar en contentData
const mockContentEntity = {
  id: "content-mock-id",
  title: "Mock Content Title",
  description: "Mock Content Description",
  type: "lesson", // O el tipo apropiado
  // Añadir otras propiedades necesarias de la entidad Content
};

describe("AutoGradingService", () => {
  let service: AutoGradingService;
  let contentVersionRepository: Repository<ContentVersionEntity>; // Renamed to match injection
  let dictionaryService: DictionaryService; // Add DictionaryService

  const mockValidationStatus: ValidationStatus = {
    culturalAccuracy: 0.9,
    linguisticQuality: 0.85,
    communityApproval: true,
    isValidated: true,
    score: 0.88,
    dialectConsistency: 0.92,
    feedback: ["Buen trabajo inicial"],
  };

  const mockPreviousValidationStatus: ValidationStatus = {
    culturalAccuracy: 0.8,
    linguisticQuality: 0.8,
    communityApproval: true,
    isValidated: true,
    score: 0.82,
    dialectConsistency: 0.85,
    feedback: [],
  };

  const mockMetadata: VersionMetadata = {
    tags: ["test", "prueba"],
    author: "user-1",
    reviewers: [],
    validatedBy: "validator-1",
  };

  const mockPreviousMetadata: VersionMetadata = {
    tags: ["test", "anterior"],
    author: "user-2",
    reviewers: ["reviewer-1"],
    validatedBy: "validator-1",
  };

  const mockContentData: ContentData = {
    original: "Texto original de prueba",
    translated: "Test translation text",
    culturalContext: "Contexto cultural de prueba que explica el significado",
    pronunciation: "Pronunciación de prueba",
    dialectVariation: "Dialecto de prueba",
  };

  const mockPreviousContentData: ContentData = {
    original: "Texto original anterior",
    translated: "Previous translation text",
    culturalContext: "Contexto cultural anterior",
    pronunciation: "Pronunciación anterior",
    dialectVariation: "Dialecto de prueba",
  };

  const mockVersion: ContentVersionEntity = {
    id: "1",
    contentId: "content-1",
    majorVersion: 1,
    minorVersion: 0,
    patchVersion: 0,
    status: Status.PUBLISHED,
    changeType: ChangeType.MODIFICATION,
    metadata: mockMetadata,
    content: mockContentEntity as any,
    contentData: mockContentData as any,
    validationStatus: mockValidationStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
    changes: [], // Added missing property
    isLatest: true, // Added missing property
    hasConflicts: false, // Added missing property
    relatedVersions: [], // Added missing property
    changelog: [], // Added missing property
    versionNumber: 1, // Added missing property
  };

  const mockPreviousVersion: ContentVersionEntity = {
    id: "2",
    contentId: "content-1", // Should be the same contentId for previous versions
    majorVersion: 0,
    minorVersion: 1,
    patchVersion: 0,
    status: Status.PUBLISHED,
    changeType: ChangeType.CREATION,
    metadata: mockPreviousMetadata,
    content: mockContentEntity as any,
    contentData: mockPreviousContentData as any,
    validationStatus: mockPreviousValidationStatus,
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 86400000),
    changes: [], // Added missing property
    isLatest: false, // Added missing property
    hasConflicts: false, // Added missing property
    relatedVersions: [], // Added missing property
    changelog: [], // Added missing property
    versionNumber: 0, // Added missing property
  };

  const mockContentVersionRepository = {
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getMany: jest.fn(), // Will be mocked in specific tests
    })),
  };

  const mockDictionaryService = {
    validateText: jest.fn(), // Will be mocked in specific tests
    // Add other methods if needed
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutoGradingService,
        {
          provide: getRepositoryToken(ContentVersionEntity),
          useValue: mockContentVersionRepository,
        },
        {
          provide: DictionaryService, // Use the actual service class as the token
          useValue: mockDictionaryService,
        },
      ],
    }).compile();

    service = module.get<AutoGradingService>(AutoGradingService);
    contentVersionRepository = module.get<Repository<ContentVersionEntity>>(
      getRepositoryToken(ContentVersionEntity)
    );
    dictionaryService = module.get<DictionaryService>(DictionaryService); // Get the mocked service

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("gradeContent", () => {
    it("should return a complete grading result", async () => {
      // Mock dependencies for this specific test
      mockContentVersionRepository.findOne.mockResolvedValueOnce(mockPreviousVersion);
      mockContentVersionRepository.createQueryBuilder().getMany.mockResolvedValue([]); // No similar content for simplicity
      mockDictionaryService.validateText.mockResolvedValue({
        isValid: true,
        errors: [],
        suggestions: [],
        linguisticQualityScore: 1.0,
      });

      const result = await service.gradeContent(mockVersion);

      expect(result).toHaveProperty("score");
      expect(result).toHaveProperty("breakdown");
      expect(result).toHaveProperty("feedback");
      expect(result).toHaveProperty("suggestions");
      expect(result).toHaveProperty("confidence");
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(1);
      expect(mockContentVersionRepository.findOne).toHaveBeenCalledWith({
        where: { content: { id: mockVersion.content.id }, isLatest: true },
        order: { createdAt: "DESC" },
      });
      expect(mockContentVersionRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockDictionaryService.validateText).toHaveBeenCalledWith(mockVersion.contentData.translated);
    });

    it("should generate appropriate feedback for low scores", async () => {
      // Define a truly incomplete version based on the interface
      const incompleteContentData: ContentData = {
        original: "Texto corto",
        translated: "", // Missing
        culturalContext: "", // Missing
        pronunciation: "", // Missing
        dialectVariation: "", // Missing
      };

      const incompleteVersion: ContentVersionEntity = {
        ...mockVersion,
        contentData: incompleteContentData,
        metadata: { tags: [] } as any, // Missing tags
        validationStatus: { // Low scores
          culturalAccuracy: 0.1,
          linguisticQuality: 0.1,
          communityApproval: false,
          isValidated: false,
          score: 0.1,
          dialectConsistency: 0.1,
          feedback: [],
        },
      };

      // Mock dependencies for this specific test
      mockContentVersionRepository.findOne.mockResolvedValueOnce(undefined); // No previous version
      mockContentVersionRepository.createQueryBuilder().getMany.mockResolvedValue([]); // No similar content
      mockDictionaryService.validateText.mockResolvedValue({
        isValid: false,
        errors: ["Error de validación"],
        suggestions: ["Sugerencia de validación"],
        linguisticQualityScore: 0.1,
      });

      const result = await service.gradeContent(incompleteVersion);

      expect(result.feedback.length).toBeGreaterThan(0);
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.score).toBeLessThan(0.5); // Expect a low score
    });

    it("should calculate confidence based on criteria consistency", async () => {
      // Mock dependencies for this specific test
      mockContentVersionRepository.findOne.mockResolvedValueOnce(mockPreviousVersion);
      mockContentVersionRepository.createQueryBuilder().getMany.mockResolvedValue([]); // No similar content for simplicity
      mockDictionaryService.validateText.mockResolvedValue({
        isValid: true,
        errors: [],
        suggestions: [],
        linguisticQualityScore: 1.0,
      });

      const result = await service.gradeContent(mockVersion);

      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe("evaluateCompleteness", () => {
    it("should return a high score for a complete content object", () => {
      const completeContent: ContentData = {
        original: "This is the original text.",
        translated: "Esta es la traducción.",
        culturalContext: "This provides cultural context.",
        pronunciation: "pro-nun-ci-a-cion",
        dialectVariation: "Variación dialectal.",
      };
      const completeVersion: ContentVersionEntity = { // Use Entity type
        ...mockVersion,
        contentData: completeContent,
      };

      const completenessScore = (service as any).evaluateCompleteness(
        completeVersion
      );
      expect(completenessScore).toBeGreaterThan(0.8); // Use range
    });

    it("should return a lower score for missing required fields", () => {
      const incompleteContent: ContentData = {
        original: "", // Missing
        translated: "Esta es la traducción.",
        culturalContext: "", // Missing
        pronunciation: "pro-nun-ci-a-cion",
        dialectVariation: "Variación dialectal.",
      };
      const incompleteVersion: ContentVersionEntity = { // Use Entity type
        ...mockVersion,
        contentData: incompleteContent,
      };

      const completenessScore = (service as any).evaluateCompleteness(
        incompleteVersion
      );
      expect(completenessScore).toBeLessThan(0.8); // Use range
      expect(completenessScore).toBeGreaterThanOrEqual(0);
    });

    it("should return a lower score for empty or whitespace-only fields", () => {
      const whitespaceContent: ContentData = {
        original: "   ", // Whitespace only
        translated: "Esta es la traducción.",
        culturalContext: "\n", // Whitespace only
        pronunciation: "pro-nun-ci-a-cion",
        dialectVariation: "Variación dialectal.",
      };
      const whitespaceVersion: ContentVersionEntity = { // Use Entity type
        ...mockVersion,
        contentData: whitespaceContent,
      };

      const completenessScore = (service as any).evaluateCompleteness(
        whitespaceVersion
      );
      expect(completenessScore).toBeLessThan(0.8); // Use range
      expect(completenessScore).toBeGreaterThanOrEqual(0);
    });

    it("should factor in the length of key fields", () => {
      const shortContent: ContentData = {
        original: "Short",
        translated: "Corta",
        culturalContext: "Context",
        pronunciation: "pro",
        dialectVariation: "dial",
      };
      const shortVersion: ContentVersionEntity = { // Use Entity type
        ...mockVersion,
        contentData: shortContent,
      };

      const longContent: ContentData = {
        original:
          "This is a much longer original text to test the length scoring.",
        translated:
          "Esta es una traducción mucho más larga para probar la puntuación de longitud.",
        culturalContext:
          "This cultural context is significantly longer to provide more detail and test the length scoring for this field.",
        pronunciation: "pro-nun-ci-a-cion-mas-larga",
        dialectVariation: "Variación dialectal con mas detalles.",
      };
      const longVersion: ContentVersionEntity = { // Use Entity type
        ...mockVersion,
        contentData: longContent,
      };

      const shortScore = (service as any).evaluateCompleteness(shortVersion);
      const longScore = (service as any).evaluateCompleteness(longVersion);

      expect(longScore).toBeGreaterThan(shortScore);
    });
  });

  describe("evaluateAccuracy", () => {
    it("should return a high score for consistent original and translated content", async () => {
      const consistentContent: ContentData = {
        original: "This is a test sentence.",
        translated: "Esta es una oración de prueba.",
        culturalContext: "Contexto.",
        pronunciation: "pro",
        dialectVariation: "dial",
      };
      const consistentVersion: ContentVersionEntity = { // Use Entity type
        ...mockVersion,
        contentData: consistentContent,
      };

      // Mock DictionaryService.validateText for this test
      mockDictionaryService.validateText.mockResolvedValue({
        isValid: true,
        errors: [],
        suggestions: [],
        linguisticQualityScore: 1.0, // High linguistic quality
      });

      // Mock compareWithPreviousVersion to return a high score
      jest.spyOn(service as any, "compareWithPreviousVersion").mockResolvedValue(1.0);


      const accuracyScore = await (service as any).evaluateAccuracy(
        consistentVersion
      );
      // Expected score based on weights (0.4 for consistency, 0.3 for linguistic patterns, 0.3 for previous version)
      // Assuming consistency score is high (close to 1.0) for consistent content
      // Score = (consistency * 0.4) + (linguisticPatterns * 0.3) + (previousVersionComparison * 0.3)
      // With no previous version, previousVersionComparison is 0.
      // Score = (1.0 * 0.4) + (1.0 * 0.3) + (0 * 0.3) = 0.4 + 0.3 + 0 = 0.7
      expect(accuracyScore).toBeCloseTo(0.7);
      expect(mockDictionaryService.validateText).toHaveBeenCalledWith(consistentContent.translated);
      expect(service["compareWithPreviousVersion"]).toHaveBeenCalledWith(consistentVersion, undefined); // Should be called with undefined previous version
    });

    it("should return a lower score for inconsistent original and translated content", async () => {
      const inconsistentContent: ContentData = {
        original: "Short text.",
        translated: "Very long translation that does not match.",
        culturalContext: "Contexto.",
        pronunciation: "pro",
        dialectVariation: "dial",
      };
      const inconsistentVersion: ContentVersionEntity = { // Use Entity type
        ...mockVersion,
        contentData: inconsistentContent,
      };

      // Mock DictionaryService.validateText for this test
      mockDictionaryService.validateText.mockResolvedValue({
        isValid: true,
        errors: [],
        suggestions: [],
        linguisticQualityScore: 1.0, // High linguistic quality
      });

      // Mock compareWithPreviousVersion to return a high score
      jest.spyOn(service as any, "compareWithPreviousVersion").mockResolvedValue(1.0);


      const accuracyScore = await (service as any).evaluateAccuracy(
        inconsistentVersion
      );
      expect(accuracyScore).toBeLessThan(0.7); // Expect lower than the high score case
    });

    it("should factor in linguistic patterns score", async () => {
      const content: ContentData = {
        original: "Text with patterns.",
        translated: "Texto con patrones.",
        culturalContext: "Contexto.",
        pronunciation: "pro",
        dialectVariation: "dial",
      };
      const version: ContentVersionEntity = { ...mockVersion, contentData: content }; // Use Entity type

      // Mock compareWithPreviousVersion to return 0 (no previous version)
      jest.spyOn(service as any, "compareWithPreviousVersion").mockResolvedValue(0);

      // Test with different linguistic patterns scores
      mockDictionaryService.validateText.mockResolvedValue({
        isValid: true,
        errors: [],
        suggestions: [],
        linguisticQualityScore: 0.2, // Low linguistic quality
      });
      const scoreLowPatterns = await (service as any).evaluateAccuracy(version);

      mockDictionaryService.validateText.mockResolvedValue({
        isValid: true,
        errors: [],
        suggestions: [],
        linguisticQualityScore: 0.8, // High linguistic quality
      });
      const scoreHighPatterns = await (service as any).evaluateAccuracy(
        version
      );

      expect(scoreHighPatterns).toBeGreaterThan(scoreLowPatterns);
    });

    it("should factor in comparison with previous version score", async () => {
      const content: ContentData = {
        original: "Text to compare.",
        translated: "Texto para comparar.",
        culturalContext: "Contexto.",
        pronunciation: "pro",
        dialectVariation: "dial",
      };
      // Create a version with a previousVersionId in metadata
      const versionWithPrevious: ContentVersionEntity = {
        ...mockVersion,
        contentData: content,
        metadata: { ...mockMetadata, previousVersionId: "some-previous-id" }, // Add previousVersionId
      };

      // Mock DictionaryService.validateText for this test
      mockDictionaryService.validateText.mockResolvedValue({
        isValid: true,
        errors: [],
        suggestions: [],
        linguisticQualityScore: 1.0, // High linguistic quality
      });

      // Mock findOne to return a previous version
      mockContentVersionRepository.findOne.mockResolvedValueOnce(mockPreviousVersion);

      // Test with different previous version comparison scores
      jest.spyOn(service as any, "compareWithPreviousVersion").mockResolvedValue(0.3);
      const scoreLowComparison = await (service as any).evaluateAccuracy(
        versionWithPrevious
      );

      // Mock findOne again for the second test case
      mockContentVersionRepository.findOne.mockResolvedValueOnce(mockPreviousVersion);
      jest.spyOn(service as any, "compareWithPreviousVersion").mockResolvedValue(0.9);
      const scoreHighComparison = await (service as any).evaluateAccuracy(
        versionWithPrevious
      );

      expect(scoreHighComparison).toBeGreaterThan(scoreLowComparison);
      expect(mockContentVersionRepository.findOne).toHaveBeenCalledWith({
        where: { id: "some-previous-id" },
      });
    });

    it("should handle cases with no previous version", async () => {
      const content: ContentData = {
        original: "Text without previous.",
        translated: "Texto sin anterior.",
        culturalContext: "Contexto.",
        pronunciation: "pro",
        dialectVariation: "dial",
      };
      const version: ContentVersionEntity = {
        ...mockVersion,
        contentData: content,
        metadata: { ...mockMetadata, previousVersionId: undefined }, // No previous version ID
      };

      // Mock DictionaryService.validateText for this test
      mockDictionaryService.validateText.mockResolvedValue({
        isValid: true,
        errors: [],
        suggestions: [],
        linguisticQualityScore: 1.0, // High linguistic quality
      });

      // Spy on compareWithPreviousVersion to ensure it's called with undefined
      const compareSpy = jest.spyOn(service as any, "compareWithPreviousVersion");

      const accuracyScore = await (service as any).evaluateAccuracy(version);
      // Expected score to be calculated based only on consistency (0.4) and linguistic patterns (0.3)
      // Assuming consistency score is high (close to 1.0)
      // Score = (1.0 * 0.4) + (1.0 * 0.3) + (0 * 0.3) = 0.7
      expect(accuracyScore).toBeCloseTo(0.7);
      expect(mockDictionaryService.validateText).toHaveBeenCalledWith(content.translated);
      expect(compareSpy).toHaveBeenCalledWith(version, undefined); // Should be called with undefined previous version
      compareSpy.mockRestore(); // Restore the spy
    });
  });

  describe("evaluateCulturalRelevance", () => {
    it("should return a high score for content with detailed cultural context and references", () => {
      const content: ContentData = {
        original: "Original.",
        translated: "Traducido.",
        culturalContext:
          "Este es un contexto cultural detallado que menciona una tradición importante y una costumbre local.", // Long and with terms
        pronunciation: "pro",
        dialectVariation: "dial",
      };
      const version: ContentVersionEntity = { ...mockVersion, contentData: content }; // Use Entity type

      const culturalScore = (service as any).evaluateCulturalRelevance(version);
      // Expected score based on presence (0.4) + length (calculated based on mock string length) + references (1.0 * 0.3 = 0.3)
      // "Este es un contexto cultural detallado que menciona una tradición importante y una costumbre local." tiene 100 caracteres.
      // Length score: Math.min(100 / 200, 1) * 0.3 = 0.5 * 0.3 = 0.15
      // Total expected score: 0.4 + 0.15 + 0.3 = 0.85
      expect(culturalScore).toBeCloseTo(0.85);
    });

    it("should return a lower score for content with short cultural context and no references", () => {
      const content: ContentData = {
        original: "Original.",
        translated: "Traducido.",
        culturalContext: "Corto.", // Short and no terms
        pronunciation: "pro",
        dialectVariation: "dial",
      };
      const version: ContentVersionEntity = { ...mockVersion, contentData: content }; // Use Entity type

      const culturalScore = (service as any).evaluateCulturalRelevance(version);
      expect(culturalScore).toBeLessThan(0.85); // Use range
      expect(culturalScore).toBeGreaterThanOrEqual(0);
    });

    it("should factor in the length of cultural context", () => {
      const shortContent: ContentData = {
        original: "Short",
        translated: "Corta",
        culturalContext: "Context", // Short
        pronunciation: "pro",
        dialectVariation: "dial",
      };
      const shortVersion: ContentVersionEntity = { // Use Entity type
        ...mockVersion,
        contentData: shortContent,
      };

      const longContent: ContentData = {
        original:
          "This is a much longer original text to test the length scoring.",
        translated:
          "Esta es una traducción mucho más larga para probar la puntuación de longitud.",
        culturalContext:
          "This cultural context is significantly longer to provide more detail and test the length scoring for this field.", // Long
        pronunciation: "pro-nun-ci-a-cion-mas-larga",
        dialectVariation: "Variación dialectal con mas detalles.",
      };
      const longVersion: ContentVersionEntity = { // Use Entity type
        ...mockVersion,
        contentData: longContent,
      };

      const shortScore = (service as any).evaluateCulturalRelevance(
        shortVersion
      );
      const longScore = (service as any).evaluateCulturalRelevance(longVersion);

      expect(longScore).toBeGreaterThan(shortScore);
    });

    it("should factor in the presence of cultural references", () => {
      const noReferencesContent: ContentData = {
        original: "Original.",
        translated: "Traducido.",
        culturalContext:
          "Este contexto no menciona términos culturales específicos.", // Long but no terms
        pronunciation: "pro",
        dialectVariation: "dial",
      };
      const noReferencesVersion: ContentVersionEntity = { // Use Entity type
        ...mockVersion,
        contentData: noReferencesContent,
      };

      const withReferencesContent: ContentData = {
        original: "Original.",
        translated: "Traducido.",
        culturalContext:
          "Este contexto menciona una tradición y una costumbre.", // Long and with terms
        pronunciation: "pro",
        dialectVariation: "dial",
      };
      const withReferencesVersion: ContentVersionEntity = { // Use Entity type
        ...mockVersion,
        contentData: withReferencesContent,
      };

      const noReferencesScore = (service as any).evaluateCulturalRelevance(
        noReferencesVersion
      );
      const withReferencesScore = (service as any).evaluateCulturalRelevance(
        withReferencesVersion
      );

      expect(withReferencesScore).toBeGreaterThan(noReferencesScore);
    });

    it("should return 0 for empty cultural context", () => {
      const emptyContent: ContentData = {
        original: "Original.",
        translated: "Traducido.",
        culturalContext: "", // Empty
        pronunciation: "pro",
        dialectVariation: "dial",
      };
      const emptyVersion: ContentVersionEntity = { // Use Entity type
        ...mockVersion,
        contentData: emptyContent,
      };

      const culturalScore = (service as any).evaluateCulturalRelevance(
        emptyVersion
      );
      expect(culturalScore).toBeCloseTo(0);
    });
  });

  describe("evaluateDialectConsistency", () => {
    it("should return a high score when similar content with matching dialect is found and coherence is high", async () => {
      const content: ContentData = {
        original: "Original.",
        translated: "Traducido.",
        culturalContext: "Contexto.",
        pronunciation: "pro",
        dialectVariation: "Dialecto A", // Dialect is present
      };
      const version: ContentVersionEntity = { ...mockVersion, contentData: content };

      // Mock the repository chain to return similar content with matching dialect
      const similarContentMock: ContentVersionEntity[] = [
        {
          ...mockPreviousVersion,
          contentData: { dialectVariation: "Dialecto A" } as any, // Matching dialect
        },
        {
          ...mockPreviousVersion,
          contentData: { dialectVariation: "Dialecto B" } as any, // Non-matching dialect
        },
      ];

      mockContentVersionRepository.createQueryBuilder().getMany.mockResolvedValue(similarContentMock);

      // Mock analyzeDialectCoherence to return a high score
      jest.spyOn(service as any, "analyzeDialectCoherence").mockReturnValue(1.0);

      const dialectConsistencyScore = await (
        service as any
      ).evaluateDialectConsistency(version);
      // Expected score: (0.6 * compareDialectPatterns result) + (0.4 * analyzeDialectCoherence result)
      // compareDialectPatterns result should be 0.5 based on similarContentMock (1 matching / 2 total)
      const expectedScore = 0.6 * 0.5 + 0.4 * 1.0; // 0.3 + 0.4 = 0.7
      expect(dialectConsistencyScore).toBeCloseTo(0.7);
      expect(mockContentVersionRepository.createQueryBuilder).toHaveBeenCalled();
      expect(service["compareDialectPatterns"]).toHaveBeenCalledWith(
        version,
        similarContentMock
      );
      expect(service["analyzeDialectCoherence"]).toHaveBeenCalledWith(content);
    });

    it("should return a lower score when no similar content is found", async () => {
      const content: ContentData = {
        original: "Original.",
        translated: "Traducido.",
        culturalContext: "Contexto.",
        pronunciation: "pro",
        dialectVariation: "Dialecto A", // Dialect is present
      };
      const version: ContentVersionEntity = { ...mockVersion, contentData: content };

      // Mock the repository chain to return no similar content
      mockContentVersionRepository.createQueryBuilder().getMany.mockResolvedValue([]);

      // Mock analyzeDialectCoherence to return a high score
      jest.spyOn(service as any, "analyzeDialectCoherence").mockReturnValue(1.0);

      const dialectConsistencyScore = await (
        service as any
      ).evaluateDialectConsistency(version);
      // Expected score based only on coherence (0.6 * 0 + 0.4 * 1.0 = 0.4)
      expect(dialectConsistencyScore).toBeCloseTo(0.4);
      expect(mockContentVersionRepository.createQueryBuilder).toHaveBeenCalled();
      expect(service["compareDialectPatterns"]).not.toHaveBeenCalled();
      expect(service["analyzeDialectCoherence"]).toHaveBeenCalledWith(content);
    });

    it("should return a lower score when coherence is low", async () => {
      const content: ContentData = {
        original: "Original.",
        translated: "Traducido.",
        culturalContext: "Contexto.",
        pronunciation: "pro",
        dialectVariation: "Dialecto A", // Dialect is present
      };
      const version: ContentVersionEntity = { ...mockVersion, contentData: content };

      // Mock the repository chain to return similar content
      const similarContentMock: ContentVersionEntity[] = [
        {
          ...mockPreviousVersion,
          contentData: { dialectVariation: "Dialecto A" } as any, // Matching dialect
        },
        {
          ...mockPreviousVersion,
          contentData: { dialectVariation: "Dialecto B" } as any, // Non-matching dialect
        },
      ];
      mockContentVersionRepository.createQueryBuilder().getMany.mockResolvedValue(similarContentMock);

      // Mock analyzeDialectCoherence to return a low score
      jest.spyOn(service as any, "analyzeDialectCoherence").mockReturnValue(0.05);

      const dialectConsistencyScore = await (
        service as any
      ).evaluateDialectConsistency(version);
      // Expected score: (0.6 * compareDialectPatterns result) + (0.4 * analyzeDialectCoherence result)
      // compareDialectPatterns result should be 0.5 based on similarContentMock (1 matching / 2 total)
      const expectedScore = 0.6 * 0.5 + 0.4 * 0.05; // 0.3 + 0.02 = 0.32
      expect(dialectConsistencyScore).toBeCloseTo(0.32);
      expect(mockContentVersionRepository.createQueryBuilder).toHaveBeenCalled();
      expect(service["compareDialectPatterns"]).toHaveBeenCalledWith(
        version,
        similarContentMock
      );
      expect(service["analyzeDialectCoherence"]).toHaveBeenCalledWith(content);
    });

    it("should return 0 when dialectVariation is missing", async () => {
      const content: ContentData = {
        original: "Original.",
        translated: "Traducido.",
        culturalContext: "Contexto.",
        pronunciation: "pro",
        dialectVariation: "", // Missing dialect
      };
      const version: ContentVersionEntity = { ...mockVersion, contentData: content };

      // Mock the repository (should not be called if dialectVariation is missing)
      mockContentVersionRepository.createQueryBuilder = jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      }));

      // Spy on the internal calculation methods to ensure they are not called
      const compareSpy = jest.spyOn(service as any, "compareDialectPatterns");
      const analyzeSpy = jest.spyOn(service as any, "analyzeDialectCoherence");

      const dialectConsistencyScore = await (
        service as any
      ).evaluateDialectConsistency(version);
      expect(dialectConsistencyScore).toBeCloseTo(0);
      expect(mockContentVersionRepository.createQueryBuilder).not.toHaveBeenCalled();
      expect(compareSpy).not.toHaveBeenCalled();
      expect(analyzeSpy).not.toHaveBeenCalled();

      compareSpy.mockRestore();
      analyzeSpy.mockRestore();
    });
  });
});
