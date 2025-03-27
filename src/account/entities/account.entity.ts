import { Status } from 'src/common/enums/status.enum';
import { User } from 'src/user/entities/user.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'enum', default: Status.INACTIVE, enum: Status })
  status: Status;

  @Column({ type: 'varchar', length: 255, nullable: true })
  refresh_token: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  access_token: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.account, { onDelete: 'CASCADE' })
  user: User;

  @BeforeInsert()
  async beforeInsert() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  @BeforeUpdate()
  async beforeUpdate() {
    this.updatedAt = new Date();
  }

  @DeleteDateColumn()
  deletedAt: Date;
}
