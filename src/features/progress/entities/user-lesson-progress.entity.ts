import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../auth/entities/user.entity';
import { Lesson } from '../../lesson/entities/lesson.entity';

@Entity('user_lesson_progress')
export class UserLessonProgress {
    @ApiProperty({ description: 'ID único del progreso de lección de usuario', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.lessonProgress)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ApiProperty({ description: 'ID del usuario', example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210' })
    @Column()
    userId: string;

    @ManyToOne(() => Lesson, lesson => lesson.userProgress)
    @JoinColumn({ name: 'lessonId' })
    lesson: Lesson;

    @ApiProperty({ description: 'ID de la lección', example: '123e4567-e89b-12d3-a456-426614174000' })
    @Column()
    lessonId: string;

    @ApiProperty({ description: 'Indica si la lección ha sido completada por el usuario', example: false })
    @Column({ default: false })
    isCompleted: boolean;

    @ApiProperty({ description: 'Porcentaje de completitud de la lección', example: 75.5 })
    @Column({ type: 'float', default: 0 })
    completionPercentage: number;

    @ApiProperty({ description: 'Puntuación total obtenida en la lección', example: 150 })
    @Column({ type: 'float', default: 0 })
    score: number;

    @ApiProperty({ description: 'Número de ejercicios completados en la lección', example: 5 })
    @Column({ type: 'int', default: 0 })
    completedExercisesCount: number;

    @ApiProperty({ description: 'Fecha de creación del registro', example: '2023-01-01T10:00:00Z' })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({ description: 'Fecha de última actualización del registro', example: '2023-01-01T11:00:00Z' })
    @UpdateDateColumn()
    updatedAt: Date;
}
