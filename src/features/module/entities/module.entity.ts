import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Unity } from '../../unity/entities/unity.entity'; // Import Unity entity

@Entity()
export class Module {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(() => Unity, (unity) => unity.module) // Define the one-to-many relationship with Unity
  unities: Unity[];
}
