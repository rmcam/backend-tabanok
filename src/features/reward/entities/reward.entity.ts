import { Activity } from 'src/activities/entities/activity.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Reward {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    type: string; // badge, achievement, points, etc.

    @Column({ type: 'integer', default: 0 })
    points: number;

    @Column({ type: 'jsonb', nullable: true })
    criteria: Record<string, any>; // Criterios para obtener la recompensa

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>; // Datos adicionales (imagen, sonido, etc.)

    @ManyToOne(() => User)
    user: User;

    @ManyToOne(() => Activity, { nullable: true })
    activity?: Activity;

    @Column({ default: false })
    isUnlocked: boolean;

    @Column({ type: 'timestamp', nullable: true })
    unlockedAt?: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
