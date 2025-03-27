import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Account {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ default: 0 })
    streak: number;

    @Column({ type: 'date', nullable: true })
    lastActivity: Date;

    @Column({ type: 'json', default: {} })
    settings: Record<string, any>;

    @Column({ type: 'json', default: {} })
    preferences: Record<string, any>;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, user => user.accounts)
    user: User;

    @Column()
    userId: string;

    @Column({ default: 0 })
    points: number;

    @Column({ default: 1 })
    level: number;
} 