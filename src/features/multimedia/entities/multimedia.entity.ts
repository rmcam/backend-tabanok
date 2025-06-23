import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm'; // Añadir JoinColumn
import { ApiProperty } from '@nestjs/swagger';
import { Lesson } from '../../lesson/entities/lesson.entity';
import { Topic } from '../../topic/entities/topic.entity'; // Importar la entidad Topic

@Entity()
export class Multimedia {
  @ApiProperty({ description: 'ID único del archivo multimedia', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Nombre original del archivo', example: 'imagen.png' })
  @Column()
  fileName: string;

  @ApiProperty({ description: 'Ruta o URL del archivo almacenado', example: 'uploads/imagen.png' })
  @Column()
  filePath: string; // Or URL if using cloud storage

  @ApiProperty({ description: 'Tipo de archivo (imagen, video, audio)', example: 'image' })
  @Column()
  fileType: string; // e.g., 'image', 'video', 'audio'

  @ApiProperty({ description: 'Tipo MIME del archivo', example: 'image/png', nullable: true })
  @Column({ nullable: true })
  mimeType: string;

  @ApiProperty({ description: 'Tamaño del archivo en bytes', example: 102400 })
  @Column({ nullable: true })
  size: number; // in bytes

  // Relación con Lesson
  @ManyToOne(() => Lesson, lesson => lesson.multimedia)
  @JoinColumn({ name: 'lessonId' }) // Asumiendo que hay un lessonId en Multimedia
  lesson: Lesson;

  @ApiProperty({ description: 'ID de la lección a la que pertenece el multimedia', example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210', nullable: true })
  @Column({ nullable: true })
  lessonId: string;

  // Relación con Topic
  @ManyToOne(() => Topic, topic => topic.multimedia)
  @JoinColumn({ name: 'topicId' }) // Asumiendo que hay un topicId en Multimedia
  topic: Topic;

  @ApiProperty({ description: 'ID del tema al que pertenece el multimedia', example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210', nullable: true })
  @Column({ nullable: true })
  topicId: string;

  @ApiProperty({ description: 'ID del usuario que subió el archivo', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @Column()
  userId: string;

  @ApiProperty({ description: 'Fecha de subida del archivo', example: '2023-01-01T10:00:00Z' })
  @CreateDateColumn()
  uploadDate: Date; // Add upload date

  // Add other relevant fields as needed, e.g., description, uploader user
}
