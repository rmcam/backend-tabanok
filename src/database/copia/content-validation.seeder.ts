import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { ContentValidation } from '../../features/content-validation/entities/content-validation.entity';
import { ContentType, ValidationStatus } from '../../features/content-validation/interfaces/content-validation.interface';
import { Content } from '../../features/content/entities/content.entity'; // Import Content entity
import { User } from '../../auth/entities/user.entity'; // Import User entity

export default class ContentValidationSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const contentValidationRepository = this.dataSource.getRepository(ContentValidation);
    const contentRepository = this.dataSource.getRepository(Content); // Get Content repository
    const userRepository = this.dataSource.getRepository(User); // Get User repository

    await contentValidationRepository.clear(); // Clear the table before seeding

    const contents = await contentRepository.find(); // Fetch all content
    const users = await userRepository.find(); // Fetch all users

    if (contents.length === 0 || users.length === 0) {
      console.log('Skipping ContentValidationSeeder: No content or users found.');
      return;
    }

    const contentValidationsToSeed: Partial<ContentValidation>[] = [];
    const now = new Date();

    // Create content validation records by iterating through content and assigning validators/submitters
    for (const content of contents) {
        // Simulate a random number of validation records per content (0 to 3)
        const numValidations = Math.floor(Math.random() * 4);

        for (let i = 0; i < numValidations; i++) {
            const submittedBy = users[Math.floor(Math.random() * users.length)]; // Random submitter
            const submissionDate = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000); // Submitted in last 90 days

            // Simulate validation status and details
            const statusRoll = Math.random();
            let validationStatus: ValidationStatus;
            let validatedBy: string[] = [];
            let validationScore = 0;
            let feedback: any[] = [];
            let lastModifiedDate = submissionDate;
            let communityVotes = { upvotes: 0, downvotes: 0, userVotes: {} };
            let reviewCount = 0;
            let lastReviewDate: Date | null = null;
            let validationHistory: any[] = [];


            if (statusRoll < 0.5) { // 50% chance of being Pending
                validationStatus = ValidationStatus.PENDING;
            } else if (statusRoll < 0.8) { // 30% chance of being Needs Review
                validationStatus = ValidationStatus.NEEDS_REVIEW; // Use NEEDS_REVIEW
                const reviewer = users[Math.floor(Math.random() * users.length)];
                validatedBy = [reviewer.id];
                lastModifiedDate = new Date(submissionDate.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000); // Modified after submission
                reviewCount = 1;
                lastReviewDate = lastModifiedDate;
                validationHistory.push({ status: ValidationStatus.NEEDS_REVIEW, timestamp: lastModifiedDate, validatorId: reviewer.id }); // Use NEEDS_REVIEW
            } else if (statusRoll < 0.95) { // 15% chance of being Approved
                validationStatus = ValidationStatus.APPROVED;
                const validator = users[Math.floor(Math.random() * users.length)];
                validatedBy = [validator.id];
                validationScore = Math.floor(Math.random() * 2) + 4; // Score 4 or 5 for approved
                lastModifiedDate = new Date(submissionDate.getTime() + Math.random() * 20 * 24 * 60 * 60 * 1000); // Modified after submission
                reviewCount = 1;
                lastReviewDate = lastModifiedDate;
                validationHistory.push({ status: ValidationStatus.APPROVED, timestamp: lastModifiedDate, validatorId: validator.id, score: validationScore });
                // Simulate some community votes for approved content
                const numUpvotes = Math.floor(Math.random() * 20);
                const numDownvotes = Math.floor(Math.random() * 3);
                communityVotes.upvotes = numUpvotes;
                communityVotes.downvotes = numDownvotes;
                // Simulate some users voting
                users.sort(() => 0.5 - Math.random()).slice(0, numUpvotes + numDownvotes).forEach(voter => {
                    communityVotes.userVotes[voter.id] = Math.random() > (numDownvotes / (numUpvotes + numDownvotes)) ? true : false; // Simulate vote direction
                });

            } else { // 5% chance of being Rejected
                validationStatus = ValidationStatus.REJECTED;
                const validator = users[Math.floor(Math.random() * users.length)];
                validatedBy = [validator.id];
                validationScore = Math.floor(Math.random() * 3); // Score 0 to 2 for rejected
                lastModifiedDate = new Date(submissionDate.getTime() + Math.random() * 20 * 24 * 60 * 60 * 1000); // Modified after submission
                reviewCount = 1;
                lastReviewDate = lastModifiedDate;
                validationHistory.push({ status: ValidationStatus.REJECTED, timestamp: lastModifiedDate, validatorId: validator.id, score: validationScore });
                // Add some feedback for rejected content
                feedback.push({ criteriaId: 'generic-issue', comment: 'Content needs revision.', timestamp: lastModifiedDate, validatorId: validator.id });
            }

            // Simulate other fields
            const dialectVariation = Math.random() > 0.8 ? 'Variante B' : 'Variante A';
            const culturalContext = Math.random() > 0.5 ? 'Contexto cultural relevante' : null;
            const usageExamples = Math.random() > 0.4 ? ['Ejemplo de uso 1', 'Ejemplo de uso 2'] : [];
            const audioReference = Math.random() > 0.6 ? 'audio-url-' + Math.floor(Math.random() * 10) : null;
            const relatedContent = Math.random() > 0.7 ? ['related-content-id-' + Math.floor(Math.random() * 5)] : [];
            const isUrgent = Math.random() > 0.9; // 10% chance of being urgent
            const tags = Math.random() > 0.5 ? ['vocabulario', 'basico'] : ['gramatica', 'intermedio'];


            // Create a plain object instead of using repository.create()
            const contentValidation = {
                contentId: String(content.id), // Associate with content ID as string
                contentType: ContentType.WORD, // Use a valid ContentType enum value for seeding
                originalContent: 'Simulated original content', // Simulate original content
                translatedContent: 'Simulated translated content', // Simulate translated translatedContent
                status: validationStatus,
                criteria: { spelling: Math.random() > 0.1, grammar: Math.random() > 0.1, culturalAccuracy: Math.random() > 0.1, contextualUse: Math.random() > 0.1, pronunciation: Math.random() > 0.1 }, // Simulate criteria evaluation
                feedback: feedback,
                validatedBy: validatedBy,
                submittedBy: submittedBy.id, // Associate submitter ID
                submissionDate: submissionDate,
                lastModifiedDate: lastModifiedDate,
                validationScore: validationScore,
                communityVotes: communityVotes,
                dialectVariation: dialectVariation,
                culturalContext: culturalContext,
                usageExamples: usageExamples,
                audioReference: audioReference,
                relatedContent: relatedContent,
                metadata: { reviewCount: reviewCount, lastReviewDate: lastReviewDate, averageReviewTime: Math.floor(Math.random() * 10) + 1, validationHistory: validationHistory },
                isUrgent: isUrgent,
                tags: tags,
                createdAt: submissionDate, // Use submissionDate as creation date
                updatedAt: lastModifiedDate, // Use lastModifiedDate as update date
            };
            contentValidationsToSeed.push(contentValidation); // Add to the array
        }
    }

    // Use a single save call for efficiency
    await contentValidationRepository.save(contentValidationsToSeed);
    console.log(`Seeded ${contentValidationsToSeed.length} content validation records.`);
    console.log('ContentValidation seeder finished.');
  }
}
