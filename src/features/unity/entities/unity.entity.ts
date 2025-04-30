import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Lesson } from '../../lesson/entities/lesson.entity';
import { Topic } from '../../topic/entities/topic.entity';
import { User } from '../../../auth/entities/user.entity';
import { Module } from '../../module/entities/module.entity'; // Import Module entity

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

    @Column() // Add moduleId column for the foreign key
    moduleId: string;

    @ManyToOne(() => Module, (module) => module.unities) // Define the many-to-one relationship with Module
    @JoinColumn({ name: 'moduleId' }) // Specify the foreign key column
    module: Module;

    @OneToMany(() => Lesson, lesson => lesson.unity)
    lessons: Lesson[];

    @OneToMany(() => Topic, topic => topic.unity)
    topics: Topic[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
