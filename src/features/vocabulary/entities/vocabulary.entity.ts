import { Column, CreateDateColumn, Entity, ManyToOne, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Topic } from '../../topic/entities/topic.entity';
import { Lesson } from '../../lesson/entities/lesson.entity'; // Importar Lesson

@Entity('vocabulary')
export class Vocabulary {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    wordKamentsa: string;

    @Column()
    wordSpanish: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    example: string;

    @Column({ nullable: true })
    audioUrl: string;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ default: 0 })
    points: number;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Topic)
    topic: Topic;

    @ManyToMany(() => Lesson, lesson => lesson.vocabularies)
    lessons: Lesson[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
