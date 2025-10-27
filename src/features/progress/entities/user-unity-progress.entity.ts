import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../auth/entities/user.entity';
import { Unity } from '../../unity/entities/unity.entity';

@Entity('user_unity_progress')
export class UserUnityProgress {
    @ApiProperty({ description: 'ID único del progreso de unidad de usuario', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.unityProgress)
    @JoinColumn({ name: 'userId' })
    user: User;

    @ApiProperty({ description: 'ID del usuario', example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210' })
    @Column()
    userId: string;

    @ManyToOne(() => Unity, unity => unity.userProgress)
    @JoinColumn({ name: 'unityId' })
    unity: Unity;

    @ApiProperty({ description: 'ID de la unidad', example: '123e4567-e89b-12d3-a456-426614174000' })
    @Column()
    unityId: string;

    @ApiProperty({ description: 'Indica si la unidad ha sido completada por el usuario', example: false })
    @Column({ default: false })
    isCompleted: boolean;

    @ApiProperty({ description: 'Porcentaje de completitud de la unidad', example: 75.5 })
    @Column({ type: 'float', default: 0 })
    completionPercentage: number;

    @ApiProperty({ description: 'Puntuación total obtenida en la unidad', example: 150 })
    @Column({ type: 'float', default: 0 })
    score: number;

    @ApiProperty({ description: 'Número de ejercicios completados en la unidad', example: 10 })
    @Column({ type: 'int', default: 0 })
    completedExercisesCount: number;

    @ApiProperty({ description: 'Fecha de creación del registro', example: '2023-01-01T10:00:00Z' })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({ description: 'Fecha de última actualización del registro', example: '2023-01-01T11:00:00Z' })
    @UpdateDateColumn()
    updatedAt: Date;
}
