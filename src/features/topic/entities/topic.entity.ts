import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Unity } from '../../unity/entities/unity.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('topics')
export class Topic {
    @PrimaryColumn('uuid', { default: uuidv4() })
    id: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: 1 })
    order: number;

    @Column({ default: false })
    isLocked: boolean;

    @Column({ default: 0 })
    requiredPoints: number;

    @Column({ default: true })
    isActive: boolean;

    @Column()
    unityId: string;

    @ManyToOne(() => Unity, unity => unity.topics)
    unity: Unity;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 