import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

import { User } from 'src/user/entities/user.entity';
import { Lesson } from 'src/features/lesson/entities/lesson.entity';

@Entity()
export class Progress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  completado: boolean;

}