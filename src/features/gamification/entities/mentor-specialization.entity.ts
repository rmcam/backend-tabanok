import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Mentor } from './mentor.entity';
import { v4 as uuidv4 } from 'uuid';

export enum SpecializationType {
    DANZA = 'DANZA',
    MUSICA = 'MUSICA',
    MEDICINA_TRADICIONAL = 'MEDICINA_TRADICIONAL',
    ARTESANIA = 'ARTESANIA',
    LENGUA = 'LENGUA',
    HISTORIA_ORAL = 'HISTORIA_ORAL',
    RITUAL = 'RITUAL',
    GASTRONOMIA = 'GASTRONOMIA'
}

@Entity('mentor_specializations')
export class MentorSpecialization {
    @PrimaryColumn('uuid', { default: () => 'uuid_generate_v4()' })
    id: string;

    @ManyToOne(() => Mentor, mentor => mentor.specializations)
    mentor: Mentor;

    @Column({
        type: 'varchar',
        enum: SpecializationType,
        default: SpecializationType.DANZA
    })
    type: SpecializationType;

    @Column('int')
    level: number; // 1-5, donde 5 es el máximo nivel de especialización

    @Column('text')
    description: string;

    @Column('json')
    certifications: {
        name: string;
        issuedBy: string;
        date: Date;
    }[];

    @Column('simple-array')
    endorsements: string[]; // IDs de otros mentores que respaldan esta especialización

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 