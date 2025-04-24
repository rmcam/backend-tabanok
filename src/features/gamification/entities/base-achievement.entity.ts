import { PrimaryGeneratedColumn, Column } from 'typeorm';

export abstract class BaseAchievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: false })
  name: string;

  @Column('text')
  description: string;

  @Column({ nullable: true, comment: 'Icon or image URL' })
  iconUrl: string;
}
