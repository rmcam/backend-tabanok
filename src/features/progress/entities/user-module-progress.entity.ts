import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../auth/entities/user.entity';
import { Module } from '../../module/entities/module.entity';

@Entity('user_module_progress')
@Unique(['user', 'module'])
export class UserModuleProgress {
    @ApiProperty({ description: 'ID único del progreso del módulo de usuario', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'Indica si el módulo ha sido completado por el usuario', example: true })
    @Column({ default: false })
    isCompleted: boolean;

    @ApiProperty({ description: 'Porcentaje de completitud del módulo', example: 75.5 })
    @Column({ type: 'float', default: 0 })
    completionPercentage: number;

    @ApiProperty({ description: 'Puntaje total acumulado en el módulo', example: 500 })
    @Column({ default: 0 })
    score: number;

    @ApiProperty({ description: 'Indica si el progreso del módulo está activo', example: true })
    @Column({ default: true })
    isActive: boolean;

    @ApiProperty({ description: 'Fecha de creación del progreso del módulo', example: '2023-01-01T10:00:00Z' })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({ description: 'Fecha de última actualización del progreso del módulo', example: '2023-01-01T11:00:00Z' })
    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.moduleProgress)
    user: User;

    @ManyToOne(() => Module, (module) => module.userProgress)
    module: Module;
}
