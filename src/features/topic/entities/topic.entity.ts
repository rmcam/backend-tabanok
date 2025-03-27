import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Activity } from '../../activity/entities/activity.entity';
import { Vocabulary } from '../../vocabulary/entities/vocabulary.entity';

@Entity()
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => Activity, (activity) => activity.topic)
  activities: Activity[];

  @OneToMany(() => Vocabulary, (vocabulary) => vocabulary.topic)
  vocabulary: Vocabulary[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
