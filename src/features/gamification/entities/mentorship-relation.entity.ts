import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { SpecializationType } from './mentor-specialization.entity';
import { Mentor } from './mentor.entity';

export enum MentorshipStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

export enum MentorshipType {
    ESTUDIANTE_ESTUDIANTE = 'ESTUDIANTE_ESTUDIANTE',
    DOCENTE_ESTUDIANTE = 'DOCENTE_ESTUDIANTE'
}

@Entity('mentorship_relations')
export class MentorshipRelation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Mentor, mentor => mentor.mentorshipRelations)
    mentor: Mentor;

    @Column()
    studentId: string;

    @Column({
        type: 'varchar',
        enum: MentorshipStatus,
        default: MentorshipStatus.PENDING
    })
    status: MentorshipStatus;

    @Column({
        type: 'enum',
        enum: MentorshipType,
        default: MentorshipType.DOCENTE_ESTUDIANTE
    })
    type: MentorshipType;

    @Column({
        type: 'varchar',
        enum: SpecializationType
    })
    focusArea: SpecializationType;

    @Column('json')
    goals: {
        description: string;
        isCompleted: boolean;
        completedAt?: Date;
    }[];

    @Column('json')
    sessions: {
        date: Date;
        duration: number; // en minutos
        topic: string;
        notes: string;
        rating?: number;
        feedback?: string;
    }[];

    @Column('json')
    progress: {
        currentLevel: number;
        pointsEarned: number;
        skillsLearned: string[];
        lastAssessment: Date;
    };

    @Column({ type: 'timestamp', nullable: true })
    startDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    endDate: Date;

    @Column('text', { nullable: true })
    completionCertificate: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
