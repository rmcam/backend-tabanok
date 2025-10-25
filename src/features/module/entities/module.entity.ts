import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Unity } from '../../unity/entities/unity.entity'; // Import Unity entity
import { UserModuleProgress } from '../../progress/entities/user-module-progress.entity';

@Entity()
export class Module {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  description: string;

  @OneToMany(() => Unity, (unity) => unity.module) // Define the one-to-many relationship with Unity
  unities: Unity[];

  @OneToMany(() => UserModuleProgress, (userModuleProgress) => userModuleProgress.module)
  userProgress: UserModuleProgress[];
}
