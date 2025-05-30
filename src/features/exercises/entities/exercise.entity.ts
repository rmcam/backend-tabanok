import { Column, Entity, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm'; // Añadir JoinColumn
import { Lesson } from '../../lesson/entities/lesson.entity';
import { Progress } from '../../progress/entities/progress.entity';
import { Topic } from '../../topic/entities/topic.entity'; // Corregir ruta de importación
import { v4 as uuidv4 } from 'uuid';

@Entity('exercises')
export class Exercise {
    @PrimaryColumn('uuid', { default: uuidv4() })
    id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    type: string;

    @Column('json')
    content: any;

    @Column()
    difficulty: string;

    @Column()
    points: number;

    @Column({ default: 0 })
    timeLimit: number;

    @Column({ default: true })
    isActive: boolean;

    @Column('uuid') // Añadir lessonId
    lessonId: string;

    @ManyToOne(() => Lesson, lesson => lesson.exercises)
    @JoinColumn({ name: 'lessonId' }) // Añadir JoinColumn para lessonId
    lesson: Lesson;

    @Column('simple-array', { nullable: true })
    tags: string[];

    @Column({ type: 'int', default: 0 })
    timesCompleted: number;

    @Column({ type: 'float', default: 0 })
    averageScore: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @ManyToOne(() => Progress)
    progress: Progress;
}
