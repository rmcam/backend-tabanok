import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Lesson } from '../../lesson/entities/lesson.entity'; // Cambiar a Lesson

@Entity('topics')
export class Topic {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: 1 })
    order: number;

    @Column({ default: false })
    isLocked: boolean;

    @Column({ default: 0 })
    requiredPoints: number;

    @Column({ default: true })
    isActive: boolean;

    @Column()
    lessonId: string; // Cambiar a lessonId

    @ManyToOne(() => Lesson, lesson => lesson.topics) // Cambiar a Lesson
    @JoinColumn({ name: 'lessonId' }) // Añadir JoinColumn
    lesson: Lesson; // Cambiar a Lesson

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
