import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { CulturalContent } from '../cultural-content/cultural-content.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('evaluation')
export class Evaluation {
    @PrimaryColumn('uuid', { default: uuidv4() })
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @ManyToOne(() => CulturalContent)
    culturalContent: CulturalContent;

    @Column({ type: 'int' })
    score: number;

    @Column({ type: 'jsonb', nullable: true })
    answers: Record<string, any>;

    @Column({ type: 'int', default: 0 })
    attemptsCount: number;

    @Column({ type: 'float', default: 0 })
    averageScore: number;

    @Column({ type: 'int', default: 0 })
    timeSpentSeconds: number;

    @Column({ type: 'jsonb', nullable: true })
    progressMetrics: {
        pronunciation: number;
        comprehension: number;
        writing: number;
        vocabulary: number;
    };

    @Column({ type: 'text', nullable: true })
    feedback: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
} 