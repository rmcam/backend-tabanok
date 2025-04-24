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

    @ManyToOne(() => Topic) // Añadir relación ManyToOne con Topic
    @JoinColumn({ name: 'topicId' }) // Añadir JoinColumn
    topic: Topic;

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

    @ManyToOne(() => Lesson, lesson => lesson.exercises)
    lesson: Lesson;

    @ManyToOne(() => Progress)
    progress: Progress;
}
