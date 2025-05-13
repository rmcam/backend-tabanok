import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('badge')
export class Badge {
    @PrimaryColumn('uuid', { default: uuidv4() })
    id: string;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'varchar', length: 50 })
    category: string;

    @Column({ type: 'varchar', length: 50 })
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

    @Column({ type: 'integer' })
    requiredPoints: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    iconUrl: string;

    @Column({ type: 'jsonb', default: {} })
    requirements: {
        achievements?: string[];
        points?: number;
        level?: number;
        customCriteria?: {
            type: string;
            value: any;
        };
    };

    @Column({ type: 'boolean', default: false })
    isSpecial: boolean;

    @Column({ type: 'date', nullable: true })
    expirationDate: Date;

    @Column({ type: 'integer', default: 0 })
    timesAwarded: number;

    @Column({ type: 'jsonb', default: [] })
    benefits: {
        type: string;
        value: any;
        description: string;
    }[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
} 