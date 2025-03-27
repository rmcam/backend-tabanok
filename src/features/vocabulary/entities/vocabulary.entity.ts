import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Topic } from '../../topic/entities/topic.entity';

@Entity()
export class Vocabulary {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    wordSpanish: string;

    @Column()
    wordKamentsa: string;

    @Column({ nullable: true })
    pronunciation: string;

    @Column({ nullable: true })
    example: string;

    @Column({ nullable: true })
    exampleTranslation: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    audioUrl: string;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Topic, topic => topic.vocabulary)
    topic: Topic;

    @Column()
    topicId: string;
} 