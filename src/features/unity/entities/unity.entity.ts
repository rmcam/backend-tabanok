import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Topic } from '../../topic/entities/topic.entity';

@Entity()
export class Unity {
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

    @Column({ default: false })
    isUnlocked: boolean;

    @Column({ default: 0 })
    requiredPoints: number;

    @OneToMany(() => Topic, topic => topic.unity)
    topics: Topic[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 