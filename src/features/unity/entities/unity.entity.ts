import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Lesson } from 'src/features/lesson/entities/lesson.entity';

@Entity()
export class Unity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @OneToMany(() => Lesson, (lesson) => lesson.unity)
  lesson: Lesson[];
}