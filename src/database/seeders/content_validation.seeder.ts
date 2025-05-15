import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { ContentValidation } from '../../features/content-validation/entities/content-validation.entity';
import { Content } from '../../features/content/entities/content.entity';
import { ContentType, ValidationStatus } from '../../features/content-validation/interfaces/content-validation.interface';
import { v4 as uuidv4 } from 'uuid';

export class ContentValidationSeeder extends DataSourceAwareSeed {
    constructor(dataSource: DataSource) {
        super(dataSource);
    }

    async run(): Promise<void> {
        console.log('Running ContentValidationSeeder...');
        const contentValidationRepository = this.dataSource.getRepository(ContentValidation);
        const contentRepository = this.dataSource.getRepository(Content);

        const contents = await contentRepository.find();

        if (contents.length === 0) {
            console.warn('No contents found. Skipping ContentValidationSeeder.');
            return;
        }

        const contentValidationData = [];

        for (let i = 0; i < 10; i++) {
            const content = contents[i % contents.length]; // Cycle through contents if needed

            contentValidationData.push({
                id: uuidv4(),
                contentId: content.id.toString(),
                contentType: ContentType.SENTENCE,
                originalContent: `Original content ${i}`,
                translatedContent: `Translated content ${i}`,
                status: ValidationStatus.PENDING,
                criteria: {
                    grammar: 'Good',
                    vocabulary: 'Appropriate',
                    style: 'Clear',
                },
                feedback: [],
                validatedBy: [],
                submittedBy: 'user123',
                submissionDate: new Date(),
                lastModifiedDate: new Date(),
                validationScore: 0,
                communityVotes: {
                    upvotes: 0,
                    downvotes: 0,
                    userVotes: {},
                },
                dialectVariation: 'Standard',
                culturalContext: 'General',
                usageExamples: [],
                relatedContent: [],
                metadata: {
                    reviewCount: 0,
                    lastReviewDate: new Date(),
                    averageReviewTime: 0,
                    validationHistory: [],
                },
                isUrgent: false,
                tags: [],
            });
        }

        await contentValidationRepository.save(contentValidationData);
        console.log('ContentValidation seeder finished.');
    }
}