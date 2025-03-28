import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Mentor } from './mentor.entity';

export enum SpecializationType {
    DANZA = 'danza',
    MUSICA = 'musica',
    MEDICINA_TRADICIONAL = 'medicina_tradicional',
    ARTESANIA = 'artesania',
    LENGUA = 'lengua',
    HISTORIA_ORAL = 'historia_oral',
    RITUAL = 'ritual',
    GASTRONOMIA = 'gastronomia'
}

@Entity('mentor_specializations')
export class MentorSpecialization {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Mentor, mentor => mentor.specializations)
    mentor: Mentor;

    @Column({
        type: 'enum',
        enum: SpecializationType
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