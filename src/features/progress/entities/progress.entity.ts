import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger'; // Importar ApiProperty
import { Exercise } from '../../exercises/entities/exercise.entity';
import { User } from '../../../auth/entities/user.entity'; // Ruta corregida
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Progress {
    @ApiProperty({ description: 'ID único del progreso', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
    @PrimaryColumn('uuid', { default: uuidv4() })
    id: string;

    @ApiProperty({ description: 'Puntaje obtenido en el progreso', example: 85 })
    @Column({ default: 0 })
    score: number;

    @ApiProperty({ description: 'Indica si el progreso ha sido completado', example: true })
    @Column({ default: false })
    isCompleted: boolean;

    @ApiProperty({ description: 'Respuestas del usuario en el ejercicio', example: { question1: 'answerA' }, nullable: true })
    @Column({ type: 'json', nullable: true })
    answers: Record<string, any>;

    @ApiProperty({ description: 'Indica si el progreso está activo', example: true })
    @Column({ default: true })
    isActive: boolean;

    @ApiProperty({ description: 'Fecha de creación del progreso', example: '2023-01-01T10:00:00Z' })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({ description: 'Fecha de última actualización del progreso', example: '2023-01-01T11:00:00Z' })
    @UpdateDateColumn()
    updatedAt: Date;

    // Relaciones (no necesitan @ApiProperty a menos que se expongan directamente en la respuesta)
    @ManyToOne(() => User, (user) => user.progress)
    user: User;

    @ManyToOne(() => Exercise)
    exercise: Exercise;
}
