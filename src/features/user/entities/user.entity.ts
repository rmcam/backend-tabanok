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

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

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
} 