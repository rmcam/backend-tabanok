import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('achievement')
export class Achievement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'varchar', length: 50 })
    category: string;

    @Column({ type: 'integer' })
    requiredValue: number;

    @Column({ type: 'integer' })
    pointsReward: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    iconUrl: string;

    @Column({ type: 'jsonb', default: {} })
    criteria: {
        type: string;
        value: number;
        comparison: 'equals' | 'greater' | 'less' | 'between';
        additionalParams?: Record<string, any>;
    };

    @Column({ type: 'boolean', default: false })
    isSecret: boolean;

    @Column({ type: 'integer', default: 0 })
    timesAwarded: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}