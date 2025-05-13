import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from '../../../auth/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('activities')
export class UserActivity {
  @PrimaryColumn('uuid', { default: uuidv4() })
  id: string;

  @Column()
  type: string;

  @Column()
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.activities)
  user: User;
}
