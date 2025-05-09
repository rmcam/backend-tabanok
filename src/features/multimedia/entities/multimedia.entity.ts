import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Lesson } from '../../lesson/entities/lesson.entity'; // Assuming multimedia is linked to lessons

@Entity()
export class Multimedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fileName: string;

  @Column()
  filePath: string; // Or URL if using cloud storage

  @Column()
  fileType: string; // e.g., 'image', 'video', 'audio'

  @Column({ nullable: true })
  mimeType: string;

  @Column({ nullable: true })
  size: number; // in bytes

  @ManyToOne(() => Lesson, lesson => lesson.multimedia)
  lesson: Lesson;

  @Column()
  userId: number;

  // Add other relevant fields as needed, e.g., description, upload date, uploader user
}
