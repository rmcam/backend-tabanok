import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger'; // Importar ApiProperty
import { Lesson } from '../../lesson/entities/lesson.entity';
import { Topic } from '../../topic/entities/topic.entity';
import { User } from '../../../auth/entities/user.entity';
import { Module } from '../../module/entities/module.entity'; // Import Module entity
// import { v4 as uuidv4 } from 'uuid'; // Eliminar si no se usa

@Entity('unities')
export class Unity {
    @ApiProperty({ description: 'ID único de la unidad', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'Título de la unidad', example: 'Unidad 1: Saludos' })
    @Column({ unique: true })
    title: string;

    @ApiProperty({ description: 'Descripción de la unidad', example: 'Aprende a saludar en Kamëntsá', nullable: true })
    @Column({ nullable: true })
    description: string;

    @ApiProperty({ description: 'Orden de la unidad dentro del módulo', example: 1 })
    @Column({ default: 1 })
    order: number;

    @ApiProperty({ description: 'Indica si la unidad está bloqueada', example: false })
    @Column({ default: false })
    isLocked: boolean;

    @ApiProperty({ description: 'Puntos requeridos para desbloquear la unidad', example: 50 })
    @Column({ default: 0 })
    requiredPoints: number;

    @ApiProperty({ description: 'Indica si la unidad está activa', example: true })
    @Column({ default: true })
    isActive: boolean;

    // Relaciones (no necesitan @ApiProperty a menos que se expongan directamente en la respuesta)
    @ManyToOne('User', 'unities')
    user: User;

    @ApiProperty({ description: 'ID del usuario propietario de la unidad', example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210' })
    @Column()
    userId: string;

    @ApiProperty({ description: 'ID del módulo al que pertenece la unidad', example: '123e4567-e89b-12d3-a456-426614174000' })
    @Column() // Add moduleId column for the foreign key
    moduleId: string;

    @ManyToOne(() => Module, (module) => module.unities) // Define the many-to-one relationship with Module
    @JoinColumn({ name: 'moduleId' }) // Specify the foreign key column
    module: Module;

    @OneToMany(() => Lesson, lesson => lesson.unity)
    lessons: Lesson[];

    @OneToMany(() => Topic, topic => topic.unity)
    topics: Topic[];

    @ApiProperty({ description: 'Fecha de creación de la unidad', example: '2023-01-01T10:00:00Z' })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({ description: 'Fecha de última actualización de la unidad', example: '2023-01-01T11:00:00Z' })
    @UpdateDateColumn()
    updatedAt: Date;
}
