import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Unity } from 'src/features/unity/entities/unity.entity';
import { Activity } from 'src/features/activity/entities/activity.entity';
import { Progress } from 'src/features/progress/entities/progress.entity';

@Entity()
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  content: string; // Puede ser un JSON o texto con el contenido de la lección

  @ManyToOne(() => Unity, (unity) => unity.lesson)
  unity: Unity;

  @OneToMany(() => Activity, (activity) => activity.lesson)
  activity: Activity[];
}