import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Lesson } from '../../lesson/entities/lesson.entity';
import { Unity } from '../../unity/entities/unity.entity';
import { Vocabulary } from '../../vocabulary/entities/vocabulary.entity';

@Entity()
export class Topic {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({ default: 1 })
    order: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Vocabulary, vocabulary => vocabulary.topic)
    vocabulary: Vocabulary[];

    @OneToMany(() => Lesson, lesson => lesson.topic)
    lessons: Lesson[];

    @ManyToOne(() => Unity, unity => unity.topics)
    unity: Unity;

    @Column({ nullable: true })
    unityId: string;
} 