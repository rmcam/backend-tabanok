export enum WebhookEventType {
    VERSION_CREATED = 'version.created',
    VERSION_UPDATED = 'version.updated',
    VERSION_PUBLISHED = 'version.published',
    BRANCH_CREATED = 'branch.created',
    BRANCH_MERGED = 'branch.merged',
    VALIDATION_COMPLETED = 'validation.completed',
    COMMENT_ADDED = 'comment.added',
    CULTURAL_REVIEW_ADDED = 'cultural_review.added'
}

export interface WebhookPayload {
    eventType: WebhookEventType;
    timestamp: string;
    data: any;
    metadata?: {
        environment: string;
        version: string;
        [key: string]: any;
    };
}

export interface WebhookSubscription {
    id: string;
    url: string;
    events: WebhookEventType[];
    secret: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastTriggeredAt?: Date;
    failureCount: number;
    metadata?: {
        description?: string;
        tags?: string[];
        [key: string]: any;
    };
} 