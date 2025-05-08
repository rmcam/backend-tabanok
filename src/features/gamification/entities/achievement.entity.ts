import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BaseAchievement } from './base-achievement.entity';
import { UserAchievement } from './user-achievement.entity';
import { Badge } from './badge.entity'; // Importar la entidad Badge


@Entity('achievements')
export class Achievement extends BaseAchievement {
  @Column({ comment: 'Criteria needed to complete, e.g., points, lessons completed' })
  criteria: string;

  @Column('int', { default: 0 })
  requirement: number;

  @Column('int', { default: 0 })
  bonusPoints: number;

  @Column({ default: false })
  isSecret: boolean;

  @Column({ default: false })
  isSpecial: boolean;

  @ManyToOne(() => Badge, { nullable: true }) // Relación ManyToOne con Badge
  @JoinColumn({ name: 'badgeId' }) // Columna para la clave foránea
  badge: Badge;

  @Column({ nullable: true }) // Columna para almacenar el ID de la medalla
  badgeId: string;

  @OneToMany(() => UserAchievement, userAchievement => userAchievement.achievement)
  userAchievements: UserAchievement[];
}
