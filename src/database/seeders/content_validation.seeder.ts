import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { ContentValidation } from '../../features/content-validation/entities/content-validation.entity';
import { Content } from '../../features/content/entities/content.entity';
import { ContentType, ValidationStatus } from '../../features/content-validation/interfaces/content-validation.interface';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class ContentValidationSeeder extends DataSourceAwareSeed {
    constructor(dataSource: DataSource) {
        super(dataSource);
    }

    async run(): Promise<void> {
        const contentValidationRepository = this.dataSource.getRepository(ContentValidation);
        const contentRepository = this.dataSource.getRepository(Content);
        const contentValidationsJsonPath = path.resolve(__dirname, '../files/json/content_validations.json');

        try {
            const contentValidationsJsonContent = JSON.parse(fs.readFileSync(contentValidationsJsonPath, 'utf-8'));

            for (const validationData of contentValidationsJsonContent) {
                const content = await contentRepository.findOne({ where: { id: validationData.contentId } });

                if (!content) {
                    console.warn(`Content with ID ${validationData.contentId} not found. Skipping.`);
                    continue;
                }

                const existingValidation = await contentValidationRepository.findOne({
                    where: {
                        contentId: String(content.id),
                        contentType: validationData.contentType as ContentType,
                        originalContent: validationData.originalContent,
                    },
                });

                if (!existingValidation) {
                    const newValidation = contentValidationRepository.create({
                        id: uuidv4(),
                        contentId: String(content.id),
                        contentType: validationData.contentType as ContentType,
                        originalContent: validationData.originalContent,
                        translatedContent: validationData.translatedContent,
                        status: validationData.status as ValidationStatus,
                        criteria: validationData.criteria,
                        feedback: validationData.feedback,
                        validatedBy: validationData.validatedBy,
                        submittedBy: validationData.submittedBy,
                        submissionDate: new Date(validationData.submissionDate),
                        lastModifiedDate: new Date(validationData.lastModifiedDate),
                        validationScore: validationData.validationScore,
                        communityVotes: validationData.communityVotes,
                        dialectVariation: validationData.dialectVariation,
                        culturalContext: validationData.culturalContext,
                        usageExamples: validationData.usageExamples,
                        relatedContent: validationData.relatedContent,
                        metadata: validationData.metadata,
                        isUrgent: validationData.isUrgent,
                        tags: validationData.tags,
                    });
                    await contentValidationRepository.save(newValidation);
                    console.log(`Content Validation for content ID "${content.id}" and original content "${validationData.originalContent}" seeded.`);
                } else {
                    console.log(`Content Validation for content ID "${content.id}" and original content "${validationData.originalContent}" already exists. Skipping.`);
                }
            }
            console.log('ContentValidation seeder finished.');
        } catch (error) {
            console.error('Error seeding content validations:', error);
        }
    }
}
