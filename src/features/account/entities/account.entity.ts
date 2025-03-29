import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../../auth/entities/user.entity';

@Entity('accounts')
export class Account {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ default: 0 })
    points: number;

    @Column({ default: 1 })
    level: number;

    @Column({ default: 0 })
    streak: number;

    @Column({ type: 'timestamp', nullable: true })
    lastActivity: Date;

    @Column({ type: 'json', default: {} })
    settings: Record<string, any>;

    @Column({ type: 'json', default: {} })
    preferences: Record<string, any>;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => User, user => user.accounts)
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 