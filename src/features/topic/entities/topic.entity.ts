import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Lesson } from '../../lesson/entities/lesson.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';
import { Multimedia } from '../../multimedia/entities/multimedia.entity'; // Importar la entidad Multimedia

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

    @OneToMany(() => Exercise, exercise => exercise.topic)
    exercises: Exercise[];

    @OneToMany(() => Multimedia, multimedia => multimedia.topic) // Añadir relación OneToMany con Multimedia
    multimedia: Multimedia[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
