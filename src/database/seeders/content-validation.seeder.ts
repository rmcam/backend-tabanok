import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { ContentValidation } from '../../features/content-validation/entities/content-validation.entity';
import { ContentType, ValidationStatus } from '../../features/content-validation/interfaces/content-validation.interface';

export default class ContentValidationSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(ContentValidation);

    const now = new Date();
    const pastDate = new Date(now);
    pastDate.setDate(now.getDate() - 5);

    const validations: Partial<ContentValidation>[] = [
      {
        contentId: 'fictional-content-id-1', // Asociar a un contenido ficticio por ahora
        contentType: ContentType.WORD, // Corregido a WORD
        originalContent: 'Ejemplo de palabra en español',
        translatedContent: 'Ejemplo de palabra en Kamëntsá',
        status: ValidationStatus.PENDING,
        criteria: { spelling: true, grammar: true, culturalAccuracy: false, contextualUse: true, pronunciation: true }, // Corregida estructura
        feedback: [],
        validatedBy: [],
        submittedBy: 'fictional-user-id-1',
        submissionDate: pastDate,
        lastModifiedDate: pastDate,
        validationScore: 0,
        communityVotes: { upvotes: 0, downvotes: 0, userVotes: {} },
        dialectVariation: 'Variante A',
        culturalContext: 'Contexto cultural relevante',
        usageExamples: ['Ejemplo de uso 1', 'Ejemplo de uso 2'],
        audioReference: 'audio-url-1',
        relatedContent: ['related-content-id-1'],
        metadata: { reviewCount: 0, lastReviewDate: pastDate, averageReviewTime: 0, validationHistory: [] },
        isUrgent: false,
        tags: ['vocabulario', 'basico'],
      },
      {
        contentId: 'fictional-content-id-2', // Asociar a un contenido ficticio por ahora
        contentType: ContentType.SENTENCE, // Corregido a SENTENCE (asumiendo que una lección contiene oraciones)
        originalContent: 'Contenido de lección en español',
        translatedContent: 'Contenido de lección en Kamëntsá',
        status: ValidationStatus.APPROVED, // Corregido a APPROVED
        criteria: { spelling: true, grammar: true, culturalAccuracy: true, contextualUse: true, pronunciation: true }, // Corregida estructura
        feedback: [{ criteriaId: 'fictional-criteria-id-1', comment: 'Validado correctamente', timestamp: now, validatorId: 'fictional-user-id-2' }], // Corregida estructura
        validatedBy: ['fictional-user-id-2'],
        submittedBy: 'fictional-user-id-3',
        submissionDate: pastDate,
        lastModifiedDate: now,
        validationScore: 5,
        communityVotes: { upvotes: 10, downvotes: 1, userVotes: { 'fictional-user-id-4': true } },
        dialectVariation: null,
        culturalContext: null,
        usageExamples: [],
        audioReference: null,
        relatedContent: [],
        metadata: { reviewCount: 1, lastReviewDate: now, averageReviewTime: 2, validationHistory: [{ status: ValidationStatus.APPROVED, timestamp: now, validatorId: 'fictional-user-id-2' }] }, // Corregido estado
        isUrgent: false,
        tags: ['leccion', 'intermedio'],
      },
    ];

    for (const validationData of validations) {
      const validation = repository.create(validationData);
      await repository.save(validation);
    }
  }
}
