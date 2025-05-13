import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('cultural_content')
export class CulturalContent {
    @PrimaryColumn('uuid', { default: uuidv4() })
    id: string;

    @Column({ type: 'varchar', length: 100 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'varchar', length: 50, default: 'general' })
    category: string;

    @Column({ type: 'text' })
    content: string;

    @Column('text', { array: true, nullable: true })
    mediaUrls?: string[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
} 