import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { MentorSpecialization } from './mentor-specialization.entity';
import { MentorshipRelation } from './mentorship-relation.entity';

export enum MentorLevel {
    APRENDIZ = 'aprendiz',
    INTERMEDIO = 'intermedio',
    AVANZADO = 'avanzado',
    MAESTRO = 'maestro',
    SABEDOR = 'sabedor'
}

@Entity('mentors')
export class Mentor {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column({
        type: 'enum',
        enum: MentorLevel,
        default: MentorLevel.APRENDIZ
    })
    level: MentorLevel;

    @Column('json')
    stats: {
        sessionsCompleted: number;
        studentsHelped: number;
        averageRating: number;
        culturalPointsAwarded: number;
    };

    @Column('json')
    availability: {
        schedule: {
            day: string;
            hours: string[];
        }[];
        maxStudents: number;
    };

    @Column('simple-array')
    achievements: string[];

    @OneToMany(() => MentorSpecialization, specialization => specialization.mentor)
    specializations: MentorSpecialization[];

    @OneToMany(() => MentorshipRelation, relation => relation.mentor)
    mentorshipRelations: MentorshipRelation[];

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 