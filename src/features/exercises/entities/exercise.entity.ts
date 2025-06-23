import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm'; // Añadir JoinColumn
import { Lesson } from '../../lesson/entities/lesson.entity';
import { Progress } from '../../progress/entities/progress.entity';
import { Topic } from '../../topic/entities/topic.entity'; // Corregir ruta de importación

@Entity('exercises')
export class Exercise {
    @PrimaryGeneratedColumn('uuid')
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

    @Column('uuid')
    topicId: string;

    @ManyToOne(() => Topic, topic => topic.exercises) // Añadir relación ManyToOne con Topic y especificar la relación inversa
    @JoinColumn({ name: 'topicId' })
    topic: Topic;

    @Column('uuid', { nullable: true }) // Añadir lessonId
    lessonId: string;

    @ManyToOne(() => Lesson, lesson => lesson.exercises) // Añadir relación ManyToOne con Lesson
    @JoinColumn({ name: 'lessonId' })
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
