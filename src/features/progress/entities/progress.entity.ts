import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Lesson } from 'src/features/lesson/entities/lesson.entity';
import { User } from 'src/user/entities/user.entity';
import { Activity } from '../../../activities/entities/activity.entity';

@Entity()
export class Progress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  completado: boolean;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Lesson)
  lesson: Lesson;

  @ManyToOne(() => Activity)
  activity: Activity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}