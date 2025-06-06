import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger'; // Importar ApiProperty
import { Lesson } from '../../lesson/entities/lesson.entity'; // Assuming multimedia is linked to lessons

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

  // Relación con Lesson (no necesita @ApiProperty a menos que se exponga directamente)
  @ManyToOne(() => Lesson, lesson => lesson.multimedia)
  lesson: Lesson;

  @ApiProperty({ description: 'ID del usuario que subió el archivo', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @Column()
  userId: string;

  @ApiProperty({ description: 'Fecha de subida del archivo', example: '2023-01-01T10:00:00Z' })
  @CreateDateColumn()
  uploadDate: Date; // Add upload date

  // Add other relevant fields as needed, e.g., description, uploader user
}
