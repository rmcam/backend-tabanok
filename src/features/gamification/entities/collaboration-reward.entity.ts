import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum CollaborationType {
    CONTENT_CREATION = 'CONTENT_CREATION',
    CONTENT_REVIEW = 'CONTENT_REVIEW',
    CULTURAL_CONTRIBUTION = 'CULTURAL_CONTRIBUTION',
    TRANSLATION = 'TRANSLATION',
    COMMUNITY_HELP = 'COMMUNITY_HELP',
    BUG_REPORT = 'BUG_REPORT'
}

@Entity('collaboration_rewards')
export class CollaborationReward {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: CollaborationType
    })
    type: CollaborationType;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column('int')
    basePoints: number;

    @Column('jsonb')
    qualityMultipliers: {
        excellent: number;
        good: number;
        average: number;
    };

    @Column('jsonb', { nullable: true })
    specialBadge?: {
        id: string;
        name: string;
        icon: string;
        requirementCount: number; // Número de colaboraciones necesarias
    };

    @Column('jsonb')
    history: Array<{
        userId: string;
        contributionId: string;
        type: CollaborationType;
        quality: 'excellent' | 'good' | 'average';
        pointsAwarded: number;
        awardedAt: Date;
        reviewedBy?: string;
    }>;

    @Column('jsonb')
    streakBonuses: {
        threshold: number; // Número de días consecutivos
        multiplier: number;
    }[];
} 