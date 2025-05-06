import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Season } from './season.entity';

export enum EventType {
    FESTIVAL = 'festival',
    CEREMONIA = 'ceremonia',
    ENCUENTRO = 'encuentro',
    TALLER = 'taller',
    COMPETITION = 'competicion',
    EXPOSICION = 'exposicion'
}

@Entity('special_events')
export class SpecialEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({
        type: 'enum',
        enum: EventType
    })
    type: EventType;

    @Column({ type: 'timestamp' })
    startDate: Date;

    @Column({ type: 'timestamp' })
    endDate: Date;

    @Column('json')
    rewards: {
        points: number;
        culturalValue: number;
        specialBadge?: {
            id: string;
            name: string;
            icon: string;
        };
    };

    @Column('json')
    requirements: {
        minLevel?: number;
        previousEvents?: string[];
        culturalAchievements?: string[];
    };

    @Column('json')
    culturalElements: {
        traditions: string[];
        vocabulary: string[];
        activities: string[];
    };

    @ManyToOne(() => Season, season => season.specialEvents)
    season: Season;

    @Column({ default: false })
    isActive: boolean;

    @Column('json', { default: [] })
    participants: {
        userId: string;
        joinedAt: Date;
        progress: number;
        completedAt?: Date;
    }[];
}
