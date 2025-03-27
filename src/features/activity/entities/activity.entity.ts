import { Lesson } from 'src/features/lesson/entities/lesson.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';


@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // Ej: "traducción", "emparejamiento", "pronunciación"

  @Column('json')
  data: any; // Datos específicos de la actividad (preguntas, respuestas, etc.)

  @ManyToOne(() => Lesson, (lesson) => lesson.activity)
  lesson: Lesson;
  
}