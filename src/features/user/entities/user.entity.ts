import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../../common/enums/role.enum';
import { Account } from '../../account/entities/account.entity';
import { Progress } from '../../progress/entities/progress.entity';
import { Reward } from '../../reward/entities/reward.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    avatar: string;

    @Column({ type: 'jsonb', default: {} })
    profile: {
        firstName?: string;
        lastName?: string;
        bio?: string;
        preferences?: {
            language?: string;
            notifications?: boolean;
            theme?: string;
        };
    };

    @Column({ type: 'simple-array', default: [] })
    roles: string[];

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.USER,
    })
    role: Role;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Progress, (progress) => progress.user)
    progress: Progress[];

    @OneToMany(() => Reward, (reward) => reward.user)
    rewards: Reward[];

    @OneToMany(() => Account, account => account.user)
    accounts: Account[];

    // Getter virtual para mantener compatibilidad con código existente
    get name(): string {
        return `${this.profile?.firstName || ''} ${this.profile?.lastName || ''}`.trim();
    }
} 