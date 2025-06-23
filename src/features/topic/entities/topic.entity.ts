import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Lesson } from '../../lesson/entities/lesson.entity';
import { Exercise } from '../../exercises/entities/exercise.entity'; // Importar la entidad Exercise

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

    @ManyToOne(() => Lesson, lesson => lesson.topics)
    @JoinColumn({ name: 'lessonId' })
    lesson: Lesson;

    @OneToMany(() => Exercise, exercise => exercise.topic) // Añadir relación OneToMany con Exercise
    exercises: Exercise[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
