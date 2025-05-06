import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Mission } from './mission.entity';
import { SpecialEvent } from './special-event.entity';

export enum SeasonType {
    BETSCNATE = 'betscnate',    // Carnaval
    JAJAN = 'jajan',            // Siembra
    BENGBE_BETSA = 'bengbe_betsa', // Espiritualidad
    ANTEUAN = 'anteuan',         // Ancestros
    FLOR_DE_MAYO = 'flor_de_mayo',
    DIA_GRANDE = 'dia_grande'
}

@Entity()
export class Season {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: SeasonType,
        default: SeasonType.BETSCNATE
    })
    type: SeasonType;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @Column('json')
    culturalElements: {
        traditions: string[];
        vocabulary: string[];
        stories: string[];
    };

    @Column('json')
    rewards: {
        points: number;
        specialBadge?: string;
        culturalItems?: string[];
    };

    @OneToMany(() => Mission, mission => mission.season)
    missions: Mission[];

    @OneToMany(() => SpecialEvent, event => event.season)
    specialEvents: SpecialEvent[];

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
