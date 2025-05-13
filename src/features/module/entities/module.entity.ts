import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Unity } from '../../unity/entities/unity.entity'; // Import Unity entity
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Module {
  @PrimaryColumn('uuid', { default: uuidv4() })
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(() => Unity, (unity) => unity.module) // Define the one-to-many relationship with Unity
  unities: Unity[];
}
