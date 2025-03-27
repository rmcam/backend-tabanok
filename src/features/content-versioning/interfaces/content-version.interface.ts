export enum ChangeType {
    CREATION = 'CREATION',
    MODIFICATION = 'MODIFICATION',
    TRANSLATION = 'TRANSLATION',
    CULTURAL_CONTEXT = 'CULTURAL_CONTEXT',
    PRONUNCIATION = 'PRONUNCIATION',
    METADATA = 'METADATA'
}

export enum ContentStatus {
    DRAFT = 'DRAFT',
    REVIEW = 'REVIEW',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED'
}

export interface ContentDiff {
    field: string;
    previousValue: any;
    newValue: any;
    reason?: string;
}

export interface VersionMetadata {
    tags: string[];
    author: string;
    authorRole?: string;
    reviewers: string[];
    validatedBy: string;
    createdAt?: Date;
    modifiedAt?: Date;
    publishedAt?: Date;
    reviewStartedAt?: Date;
    comments?: string[];
}

export interface ValidationStatus {
    culturalAccuracy: number;
    linguisticQuality: number;
    communityApproval: boolean;
    isValidated?: boolean;
    score?: number;
    dialectConsistency?: number;
    feedback?: string[];
}

export interface ContentData {
    original: string;
    translated: string;
    culturalContext: string;
    pronunciation: string;
    dialectVariation: string;
}

export interface ChangelogEntry {
    date: Date;
    author: string;
    description: string;
    type: ChangeType;
}

export interface ContentVersion {
    id: string;
    contentId: string;
    versionNumber: number;
    majorVersion: number;
    minorVersion: number;
    patchVersion: number;
    status: ContentStatus;
    changeType: ChangeType;
    changes: ContentDiff[];
    metadata: VersionMetadata;
    content: ContentData;
    validationStatus: ValidationStatus;
    previousVersion?: string;
    nextVersion?: string;
    branchName?: string;
    isLatest: boolean;
    hasConflicts: boolean;
    relatedVersions: string[];
    changelog: ChangelogEntry[];
    createdAt: Date;
    updatedAt: Date;
} 