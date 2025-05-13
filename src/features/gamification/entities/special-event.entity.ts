import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Season } from './season.entity';
import { v4 as uuidv4 } from 'uuid';

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
    @PrimaryColumn('uuid', { default: uuidv4() })
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
