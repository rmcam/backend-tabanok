import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Lesson } from '../../lesson/entities/lesson.entity';
import { Topic } from '../../topic/entities/topic.entity';
import { User } from '../../../auth/entities/user.entity';

@Entity('unities')
export class Unity {
    @PrimaryGeneratedColumn('uuid')
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

    @ManyToOne('User', 'unities')
    user: User;

    @Column()
    userId: string;

    @OneToMany(() => Lesson, lesson => lesson.unity)
    lessons: Lesson[];

    @OneToMany(() => Topic, topic => topic.unity)
    topics: Topic[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
