import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TagColor, TagType } from '../interfaces/tag.interface';

@Entity('tags')
export class Tag {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50 })
    name: string;

    @Column({
        type: 'enum',
        enum: TagType,
        default: TagType.CUSTOM
    })
    type: TagType;

    @Column({
        type: 'enum',
        enum: TagColor,
        default: TagColor.GRAY
    })
    color: TagColor;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'uuid', nullable: true })
    parentId: string;

    @ManyToOne(() => Tag, { nullable: true })
    @JoinColumn({ name: 'parentId' })
    parent: Tag;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @Column({ type: 'int', default: 0 })
    usageCount: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
} 