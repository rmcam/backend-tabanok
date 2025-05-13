import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Exercise } from '../../exercises/entities/exercise.entity';
import { User } from '../../../auth/entities/user.entity'; // Ruta corregida
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Progress {
    @PrimaryColumn('uuid', { default: uuidv4() })
    id: string;

    @Column({ default: 0 })
    score: number;

    @Column({ default: false })
    isCompleted: boolean;

    @Column({ type: 'json', nullable: true })
    answers: Record<string, any>;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.progress)
    user: User;

    @ManyToOne(() => Exercise)
    exercise: Exercise;
}
