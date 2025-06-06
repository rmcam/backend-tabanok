import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn, // Añadir esta importación
} from 'typeorm';
import { User } from '../../../auth/entities/user.entity';
// import { v4 as uuidv4 } from 'uuid'; // Eliminar si no se usa

@Entity('activities')
export class UserActivity {
  @PrimaryGeneratedColumn('uuid')
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
