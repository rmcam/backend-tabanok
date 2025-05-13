import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Topic } from '../../topic/entities/topic.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('vocabulary')
export class Vocabulary {
    @PrimaryColumn('uuid', { default: uuidv4() })
    id: string;

    @Column()
    word: string;

    @Column()
    translation: string;

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

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 