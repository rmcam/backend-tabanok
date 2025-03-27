import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Topic } from '../../topic/entities/topic.entity';

@Entity()
export class Vocabulary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  wordKamentsa: string; // Palabra en Kamëntsá

  @Column()
  wordSpanish: string; // Palabra en español

  @Column({ nullable: true })
  pronunciation: string; // Guía de pronunciación

  @Column({ type: 'text', nullable: true })
  culturalContext: string; // Contexto cultural de la palabra

  @Column({ nullable: true })
  audioUrl: string; // URL del audio de pronunciación

  @Column({ nullable: true })
  imageUrl: string; // URL de imagen ilustrativa

  @Column({ type: 'text', array: true, nullable: true })
  examples: string[]; // Ejemplos de uso en oraciones

  @Column({ type: 'text', nullable: true })
  category: string; // Categoría (sustantivo, verbo, etc.)

  @Column({ type: 'int', default: 1 })
  difficultyLevel: number; // Nivel de dificultad

  @ManyToOne(() => Topic, (topic) => topic.vocabulary)
  topic: Topic; // Relación con el tema

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 