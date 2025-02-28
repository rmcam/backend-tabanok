import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { Role } from '../../common/enums/role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  firstName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  secondName: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  firstLastName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  secondLastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ type: 'timestamp', nullable: true })
  emailVerified: Date;

  @Column({ type: 'enum', default: Role.USER, enum: Role })
  role: Role;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToOne(() => Account, (account) => account.id)
  @JoinColumn()
  account: Account;

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
