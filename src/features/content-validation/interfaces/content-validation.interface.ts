export enum ValidationStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    NEEDS_REVIEW = 'NEEDS_REVIEW'
}

export enum ContentType {
    WORD = 'WORD',
    PHRASE = 'PHRASE',
    SENTENCE = 'SENTENCE',
    DIALOGUE = 'DIALOGUE',
    CULTURAL_CONTENT = 'CULTURAL_CONTENT'
}

export interface ValidationCriteria {
    spelling: boolean;
    grammar: boolean;
    culturalAccuracy: boolean;
    contextualUse: boolean;
    pronunciation: boolean;
}

export interface ValidationFeedback {
    criteriaId: string;
    comment: string;
    suggestedCorrection?: string;
    timestamp: Date;
    validatorId: string;
}

export interface ContentValidation {
    id: string;
    contentId: string;
    contentType: ContentType;
    originalContent: string;
    translatedContent?: string;
    status: ValidationStatus;
    criteria: ValidationCriteria;
    feedback: ValidationFeedback[];
    validatedBy: string[];
    submittedBy: string;
    submissionDate: Date;
    lastModifiedDate: Date;
    validationScore: number;
    communityVotes: {
        upvotes: number;
        downvotes: number;
        userVotes: Record<string, boolean>;
    };
    dialectVariation?: string;
    culturalContext?: string;
    usageExamples?: string[];
    audioReference?: string;
    relatedContent?: string[];
} 