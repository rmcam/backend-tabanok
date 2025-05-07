import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Gamification } from './gamification.entity';
import { Season } from './season.entity';

export enum MissionFrequency {
    DIARIA = 'diaria',
    SEMANAL = 'semanal',
    MENSUAL = 'mensual',
    TEMPORADA = 'temporada',
    CONTRIBUCION = 'contribucion',
    UNICA = 'unica',
}

export enum MissionType {
    COMPLETE_LESSONS = 'COMPLETE_LESSONS',
    PRACTICE_EXERCISES = 'PRACTICE_EXERCISES',
    EARN_POINTS = 'EARN_POINTS',
    MAINTAIN_STREAK = 'MAINTAIN_STREAK',
    CULTURAL_CONTENT = 'CULTURAL_CONTENT',
    COMMUNITY_INTERACTION = 'COMMUNITY_INTERACTION',
    VOCABULARY = 'VOCABULARY',
    PERSONALIZED = 'PERSONALIZED',
    PROGRESS_BASED = 'PROGRESS_BASED',
    SEASONAL = 'SEASONAL',
    COMMUNITY = 'COMMUNITY',
    LEARN_VOCABULARY = 'LEARN_VOCABULARY',
    PARTICIPATE_FORUM = 'PARTICIPATE_FORUM',
    COMMUNITY_ENGAGEMENT = 'COMMUNITY_ENGAGEMENT',
    CONTENT_CREATION = 'CONTENT_CREATION'
}

@Entity('missions')
export class Mission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({
        type: 'enum',
        enum: MissionType
    })
    type: MissionType;

    @Column('jsonb', { nullable: true })
    criteria?: {
        type: string;
        value: any;
        description: string;
    };

    @Column({
        type: 'enum',
        enum: MissionFrequency
    })
    frequency: MissionFrequency;

    @Column('int')
    targetValue: number;

    @Column('int')
    rewardPoints: number;

    @Column('jsonb', { nullable: true })
    rewardBadge?: {
        id: string;
        name: string;
        icon: string;
    };

    @Column('timestamp')
    startDate: Date;

    @Column('timestamp')
    endDate: Date;

    @ManyToMany(() => Gamification, gamification => gamification.activeMissions)
    participants: Gamification[];

    @Column('jsonb', { default: [] })
    completedBy: {
        userId: string;
        progress: number;
        completedAt: Date | null;
    }[];

    @Column('jsonb', { nullable: true })
    bonusConditions?: {
        condition: string;
        multiplier: number;
        description: string;
    }[];

    @ManyToOne(() => Season, season => season.missions)
    season: Season;
}
