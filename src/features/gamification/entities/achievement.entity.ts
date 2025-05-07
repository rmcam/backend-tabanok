import { Entity, Column, OneToMany } from 'typeorm';
import { BaseAchievement } from './base-achievement.entity';
import { UserAchievement } from './user-achievement.entity';


@Entity('achievements')
export class Achievement extends BaseAchievement {
  @Column({ comment: 'Criteria needed to complete, e.g., points, lessons completed' })
  criteria: string;

  @Column('int', { default: 0 })
  requirement: number;

  @Column('int', { default: 0 })
  bonusPoints: number;

  @Column('jsonb', { nullable: true })
  badge?: {
    id: string;
    name: string;
    icon: string;
  };

  @Column({ default: false })
  isSecret: boolean;

  @Column({ default: false })
  isSpecial: boolean;

  @OneToMany(() => UserAchievement, userAchievement => userAchievement.achievement)
  userAchievements: UserAchievement[];
}
