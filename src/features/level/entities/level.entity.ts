import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Lesson } from '../../lesson/entities/lesson.entity';

export enum LevelType {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced'
}

@Entity()
export class Level {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    name: string;

    @Column({ type: 'text' })
    description: string;

    @Column({
        type: 'enum',
        enum: LevelType,
        default: LevelType.BEGINNER
    })
    type: LevelType;

    @Column({ type: 'int', default: 0 })
    order: number;

    @Column({ type: 'boolean', default: false })
    isLocked: boolean;

    @Column({ type: 'int', default: 0 })
    requiredPoints: number;

    @OneToMany(() => Lesson, lesson => lesson.level)
    lessons: Lesson[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 