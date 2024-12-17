import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class VerifyToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  identifier: string;

  @Column()
  token: string;

  @Column()
  expires: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
