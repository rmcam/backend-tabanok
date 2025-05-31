import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger'; // Importar ApiProperty
import { Exercise } from '../../exercises/entities/exercise.entity';
import { Multimedia } from '../../multimedia/entities/multimedia.entity';
import { Unity } from '../../unity/entities/unity.entity';
import { v4 as uuidv4 } from 'uuid';
import { BeforeInsert } from 'typeorm';

@Entity('lessons')
export class Lesson {
  @ApiProperty({ description: 'ID único de la lección', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @PrimaryColumn('uuid')
  id: string;

 @BeforeInsert()
 generateId() {
   if (!this.id) {
     this.id = uuidv4();
   }
 }

  @ApiProperty({ description: 'Título de la lección', example: 'Introducción al Kamëntsá' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Descripción de la lección', example: 'Aprende los conceptos básicos del idioma Kamëntsá', nullable: true })
  @Column({ nullable: true })
  description: string;

  @ApiProperty({ description: 'Orden de la lección dentro de la unidad', example: 1 })
  @Column({ default: 1 })
  order: number;

  @ApiProperty({ description: 'Indica si la lección está bloqueada', example: false })
  @Column({ default: false })
  isLocked: boolean;

  @ApiProperty({ description: 'Indica si la lección ha sido completada', example: false })
  @Column({ default: false })
  isCompleted: boolean;

  @ApiProperty({ description: 'Indica si la lección es destacada', example: false })
  @Column({ default: false })
  isFeatured: boolean;

  @ApiProperty({ description: 'Puntos requeridos para desbloquear la lección', example: 100 })
  @Column({ default: 0 })
  requiredPoints: number;

  @ApiProperty({ description: 'Indica si la lección está activa', example: true })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'ID de la unidad a la que pertenece la lección', example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210' })
  @Column()
  unityId: string;

  @ManyToOne(() => Unity, (unity) => unity.lessons)
  @JoinColumn({ name: 'unityId' }) // Añadir JoinColumn
  unity: Unity;

  @OneToMany(() => Exercise, (exercise) => exercise.lesson)
  exercises: Exercise[];

  @OneToMany(() => Multimedia, (multimedia: Multimedia) => multimedia.lesson)
  multimedia: Multimedia[];

  @ApiProperty({ description: 'Fecha de creación de la lección', example: '2023-01-01T10:00:00Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización de la lección', example: '2023-01-01T11:00:00Z' })
  @UpdateDateColumn()
  updatedAt: Date;
}
