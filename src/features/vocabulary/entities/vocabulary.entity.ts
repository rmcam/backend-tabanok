import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Topic } from '../../topic/entities/topic.entity';

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

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
