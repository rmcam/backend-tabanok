import { PrimaryColumn, Column, Entity } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export abstract class BaseAchievement {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: false })
  name: string;

  @Column('text')
  description: string;

  @Column({ nullable: true, comment: 'Icon or image URL' })
  iconUrl: string;
}
