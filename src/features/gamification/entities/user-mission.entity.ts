import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../../auth/entities/user.entity';
import { Mission } from './mission.entity';

@Entity('user_missions')
export class UserMission {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Mission)
  @JoinColumn({ name: 'missionId' })
  mission: Mission;
}
